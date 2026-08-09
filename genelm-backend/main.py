"""Authenticated Modal endpoint for Evo2 GRCh38 SNV likelihood scoring."""

from __future__ import annotations

import modal
from pydantic import BaseModel, ConfigDict, Field, field_validator

from variant_core import (
    DEFAULT_WINDOW_SIZE,
    SUPPORTED_GENOME,
    build_sequence_window,
    normalize_base,
    normalize_chromosome,
    score_single_nucleotide_variant,
)

EVO2_REVISION = "27f32da50d08501b5cb12e7a55f663e2ec794e0f"
MODEL_NAME = "evo2_7b"


class VariantRequest(BaseModel):
    """A genomic SNV described on the GRCh38 forward reference strand."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    variant_pos: int = Field(gt=0, description="1-based GRCh38 position")
    alt_allele: str = Field(min_length=1, max_length=1)
    expected_ref: str | None = Field(default=None, min_length=1, max_length=1)
    genome: str = SUPPORTED_GENOME
    chromosome: str

    @field_validator("genome")
    @classmethod
    def validate_genome(cls, value: str) -> str:
        if value != SUPPORTED_GENOME:
            raise ValueError("only the human GRCh38 assembly (hg38) is supported")
        return value

    @field_validator("chromosome")
    @classmethod
    def validate_chromosome(cls, value: str) -> str:
        return normalize_chromosome(value)

    @field_validator("alt_allele")
    @classmethod
    def validate_alternate(cls, value: str) -> str:
        return normalize_base(value, field_name="alternate allele")

    @field_validator("expected_ref")
    @classmethod
    def validate_expected_reference(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_base(value, field_name="expected reference")


evo2_image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.8.1-devel-ubuntu22.04",
        add_python="3.12",
    )
    .apt_install(
        "build-essential",
        "git",
        "ninja-build",
        "libcudnn9-cuda-12",
        "libcudnn9-dev-cuda-12",
    )
    .uv_pip_install(
        "fastapi[standard]==0.139.2",
        "packaging==26.3",
        "pydantic==2.13.4",
        "requests==2.34.2",
    )
    .uv_pip_install(
        "torch==2.7.1",
        index_url="https://download.pytorch.org/whl/cu128",
    )
    .uv_pip_install("flash-attn==2.8.0.post2", extra_options="--no-build-isolation")
    .run_commands(
        "git clone --recurse-submodules https://github.com/ArcInstitute/evo2.git /opt/evo2",
        f"cd /opt/evo2 && git checkout {EVO2_REVISION}",
        "cd /opt/evo2 && uv pip install --system .",
    )
)

model_cache = modal.Volume.from_name("genelm-huggingface-cache", create_if_missing=True)
cache_path = "/root/.cache/huggingface"
app = modal.App("genelm-evo2", image=evo2_image)


def fetch_grch38_window(position: int, chromosome: str) -> tuple[str, int]:
    """Fetch one fixed-size GRCh38 sequence window from UCSC."""

    import requests

    window = build_sequence_window(position, chromosome)
    response = requests.get(
        "https://api.genome.ucsc.edu/getData/sequence",
        params={
            "genome": SUPPORTED_GENOME,
            "chrom": normalize_chromosome(chromosome),
            "start": window.start,
            "end": window.end,
        },
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    sequence = payload.get("dna")
    if not isinstance(sequence, str):
        raise RuntimeError(f"UCSC sequence request failed: {payload.get('error', 'missing DNA')}")
    sequence = sequence.upper()
    if len(sequence) != DEFAULT_WINDOW_SIZE:
        raise RuntimeError(
            f"UCSC returned {len(sequence)} bp; expected {DEFAULT_WINDOW_SIZE} bp"
        )
    return sequence, window.relative_position


@app.cls(
    gpu="H100",
    volumes={cache_path: model_cache},
    max_containers=1,
    scaledown_window=300,
    timeout=600,
)
class Evo2Model:
    @modal.enter()
    def load_model(self) -> None:
        from evo2 import Evo2

        self.model = Evo2(MODEL_NAME)

    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def analyze_single_variant(self, request: VariantRequest) -> dict[str, object]:
        sequence, relative_position = fetch_grch38_window(
            request.variant_pos,
            request.chromosome,
        )
        scores = score_single_nucleotide_variant(
            self.model,
            sequence,
            relative_position,
            request.alt_allele,
            request.expected_ref,
        )
        return {
            "position": request.variant_pos,
            "chromosome": request.chromosome,
            "genome": SUPPORTED_GENOME,
            "model": MODEL_NAME,
            "context_length": DEFAULT_WINDOW_SIZE,
            **scores,
            "interpretation": (
                "delta_likelihood = alternate_score - reference_score; "
                "this research score is not a clinical classification or probability"
            ),
        }


@app.local_entrypoint()
def main() -> None:
    request = VariantRequest(
        variant_pos=43_119_628,
        alt_allele="G",
        genome="hg38",
        chromosome="chr17",
    )
    result = Evo2Model().analyze_single_variant.remote(request)
    print(result)
