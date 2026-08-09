from __future__ import annotations

import pytest

from variant_core import (
    DEFAULT_WINDOW_SIZE,
    build_sequence_window,
    make_alternate_sequence,
    normalize_chromosome,
    score_single_nucleotide_variant,
)


class FakeScorer:
    def score_sequences(
        self,
        sequences: list[str],
        *,
        reduce_method: str,
    ) -> list[float]:
        assert reduce_method == "mean"
        return [float(sequence.count("G")) for sequence in sequences]


def test_centered_window_is_exactly_8192_bp() -> None:
    window = build_sequence_window(43_119_628, "17")

    assert window.end - window.start == DEFAULT_WINDOW_SIZE
    assert window.relative_position == DEFAULT_WINDOW_SIZE // 2


def test_window_shifts_at_chromosome_start() -> None:
    window = build_sequence_window(1, "chr17")

    assert window.start == 0
    assert window.end == DEFAULT_WINDOW_SIZE
    assert window.relative_position == 0


def test_chromosome_normalization() -> None:
    assert normalize_chromosome("x") == "chrX"
    assert normalize_chromosome("chrmt") == "chrM"
    with pytest.raises(ValueError, match="chromosome"):
        normalize_chromosome("chrUn")


def test_mutation_checks_reference_and_alternate() -> None:
    reference, alternate, mutated = make_alternate_sequence("AACAA", 2, "G", "C")

    assert (reference, alternate, mutated) == ("C", "G", "AAGAA")
    with pytest.raises(ValueError, match="does not match"):
        make_alternate_sequence("AACAA", 2, "G", "A")
    with pytest.raises(ValueError, match="must differ"):
        make_alternate_sequence("AACAA", 2, "C")


def test_score_is_alternate_minus_reference_without_classification() -> None:
    result = score_single_nucleotide_variant(FakeScorer(), "AACAA", 2, "G", "C")

    assert result["delta_likelihood"] == 1.0
    assert "prediction" not in result
    assert "confidence" not in result
