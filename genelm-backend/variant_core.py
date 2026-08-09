"""Pure, testable helpers for GRCh38 single-nucleotide variant scoring."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

SUPPORTED_GENOME = "hg38"
DEFAULT_WINDOW_SIZE = 8192
DNA_BASES = frozenset("ACGT")

# UCSC GRCh38 primary-assembly chromosome sizes.
GRCH38_CHROMOSOME_SIZES = {
    "chr1": 248_956_422,
    "chr2": 242_193_529,
    "chr3": 198_295_559,
    "chr4": 190_214_555,
    "chr5": 181_538_259,
    "chr6": 170_805_979,
    "chr7": 159_345_973,
    "chr8": 145_138_636,
    "chr9": 138_394_717,
    "chr10": 133_797_422,
    "chr11": 135_086_622,
    "chr12": 133_275_309,
    "chr13": 114_364_328,
    "chr14": 107_043_718,
    "chr15": 101_991_189,
    "chr16": 90_338_345,
    "chr17": 83_257_441,
    "chr18": 80_373_285,
    "chr19": 58_617_616,
    "chr20": 64_444_167,
    "chr21": 46_709_983,
    "chr22": 50_818_468,
    "chrX": 156_040_895,
    "chrY": 57_227_415,
    "chrM": 16_569,
}


class SequenceScorer(Protocol):
    def score_sequences(self, sequences: list[str]) -> list[float]: ...


@dataclass(frozen=True)
class SequenceWindow:
    """A UCSC interval plus the zero-based variant offset within it."""

    start: int
    end: int
    relative_position: int


def normalize_chromosome(chromosome: str) -> str:
    value = chromosome.strip()
    if not value.lower().startswith("chr"):
        value = f"chr{value}"

    suffix = value[3:].upper()
    if suffix == "MT":
        suffix = "M"
    normalized = f"chr{suffix}"
    if normalized not in GRCH38_CHROMOSOME_SIZES:
        raise ValueError("chromosome must be one of chr1-chr22, chrX, chrY, or chrM")
    return normalized


def normalize_base(base: str, *, field_name: str) -> str:
    normalized = base.strip().upper()
    if normalized not in DNA_BASES:
        raise ValueError(f"{field_name} must be exactly one of A, C, G, or T")
    return normalized


def build_sequence_window(
    position: int,
    chromosome: str,
    window_size: int = DEFAULT_WINDOW_SIZE,
) -> SequenceWindow:
    """Convert a 1-based genomic position to a fixed UCSC half-open window."""

    normalized_chromosome = normalize_chromosome(chromosome)
    chromosome_size = GRCH38_CHROMOSOME_SIZES[normalized_chromosome]
    if position < 1 or position > chromosome_size:
        raise ValueError(
            f"position must be between 1 and {chromosome_size} for {normalized_chromosome}"
        )
    if window_size < 2 or window_size > chromosome_size:
        raise ValueError("window_size is invalid for the selected chromosome")

    position_zero_based = position - 1
    centered_start = position_zero_based - window_size // 2
    start = min(max(0, centered_start), chromosome_size - window_size)
    end = start + window_size
    return SequenceWindow(
        start=start,
        end=end,
        relative_position=position_zero_based - start,
    )


def make_alternate_sequence(
    reference_sequence: str,
    relative_position: int,
    alternate: str,
    expected_reference: str | None = None,
) -> tuple[str, str, str]:
    """Return normalized reference base, alternate base, and mutated sequence."""

    sequence = reference_sequence.upper()
    if relative_position < 0 or relative_position >= len(sequence):
        raise ValueError("variant position is outside the fetched sequence window")

    reference = normalize_base(sequence[relative_position], field_name="reference base")
    alternate_base = normalize_base(alternate, field_name="alternate allele")
    if expected_reference is not None:
        expected = normalize_base(expected_reference, field_name="expected reference")
        if expected != reference:
            raise ValueError(
                f"expected reference {expected} does not match GRCh38 reference {reference}"
            )
    if alternate_base == reference:
        raise ValueError("alternate allele must differ from the GRCh38 reference")

    alternate_sequence = (
        sequence[:relative_position]
        + alternate_base
        + sequence[relative_position + 1 :]
    )
    return reference, alternate_base, alternate_sequence


def score_single_nucleotide_variant(
    scorer: SequenceScorer,
    reference_sequence: str,
    relative_position: int,
    alternate: str,
    expected_reference: str | None = None,
) -> dict[str, float | str]:
    """Score reference and alternate contexts without clinical classification."""

    reference, alternate_base, alternate_sequence = make_alternate_sequence(
        reference_sequence,
        relative_position,
        alternate,
        expected_reference,
    )
    reference_score, alternate_score = scorer.score_sequences(
        [reference_sequence.upper(), alternate_sequence]
    )
    delta = float(alternate_score) - float(reference_score)
    return {
        "reference": reference,
        "alternate": alternate_base,
        "reference_score": float(reference_score),
        "alternate_score": float(alternate_score),
        "delta_likelihood": delta,
    }
