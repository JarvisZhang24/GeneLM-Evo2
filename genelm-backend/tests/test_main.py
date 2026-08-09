from __future__ import annotations

import pytest
from pydantic import ValidationError

from main import InferenceJobRequest, VariantRequest


def test_variant_request_normalizes_public_api_inputs() -> None:
    request = VariantRequest(
        variant_pos=43_119_628,
        alt_allele=" g ",
        expected_ref=" a ",
        genome="hg38",
        chromosome="17",
    )

    assert request.alt_allele == "G"
    assert request.expected_ref == "A"
    assert request.chromosome == "chr17"


def test_variant_request_rejects_unsupported_genome() -> None:
    with pytest.raises(ValidationError, match="GRCh38"):
        VariantRequest(
            variant_pos=1,
            alt_allele="A",
            genome="hg19",
            chromosome="chr1",
        )


def test_inference_job_request_accepts_exactly_one_operation() -> None:
    variant = VariantRequest(
        variant_pos=43_119_628,
        alt_allele="G",
        genome="hg38",
        chromosome="chr17",
    )

    assert InferenceJobRequest(variant=variant).variant == variant
    assert InferenceJobRequest(call_id="fc-01ABC").call_id == "fc-01ABC"

    with pytest.raises(ValidationError, match="exactly one"):
        InferenceJobRequest()
    with pytest.raises(ValidationError, match="exactly one"):
        InferenceJobRequest(variant=variant, call_id="fc-01ABC")
