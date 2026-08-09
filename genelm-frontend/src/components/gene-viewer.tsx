"use client";

import type { SingleGeneInfo } from "~/utils/genes-api";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  fetchGeneDetails,
  type GeneBounds,
  type GeneDetailsFromSearch,
} from "~/utils/gene-details-api";
import { fetchGeneSequence as apiFetchGeneSequence } from "~/utils/gene-sequence-api";
import {
  fetchClinvarVariants as apiFetchClinvarVariants,
  type ClinvarVariant,
} from "~/utils/variants-api";
import { GeneInformation } from "./gene-information";
import { GeneSequence } from "./gene-sequence";
import KnownVariants from "./known-variants";
import { VariantAnalysisDialog } from "./variant-analysis-dialog";

export default function GeneViewer({
  gene,
  onClose,
}: {
  gene: SingleGeneInfo;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [geneDetail, setGeneDetail] = useState<GeneDetailsFromSearch | null>(
    null,
  );
  const [geneBounds, setGeneBounds] = useState<GeneBounds | null>(null);
  const [startPosition, setStartPosition] = useState<string>("");
  const [geneSequence, setGeneSequence] = useState<string>("");
  const [isLoadingSequence, setIsLoadingSequence] = useState(false);
  const [actualRange, setActualRange] = useState<{
    startpos: number;
    endpos: number;
  } | null>(null);

  const [endPosition, setEndPosition] = useState<string>("");

  const [clinvarVariants, setClinvarVariants] = useState<ClinvarVariant[]>([]);
  const [isLoadingClinvar, setIsLoadingClinvar] = useState(false);
  const [errorClinvar, setErrorClinvar] = useState<string | null>(null);
  const [selectedBase, setSelectedBase] = useState<{
    position: number;
    nucleotide: string;
  } | null>(null);

  const fetchGeneSequence = useCallback(
    async (start: number, end: number) => {
      try {
        setIsLoadingSequence(true);
        setError(null);
        const { sequence, actualRange: fetchedRange } =
          await apiFetchGeneSequence(gene.chromosome, start, end);

        setGeneSequence(sequence);

        setActualRange(fetchedRange);
      } catch (sequenceError) {
        setError(
          sequenceError instanceof Error
            ? sequenceError.message
            : "Failed to load sequence data",
        );
      } finally {
        setIsLoadingSequence(false);
      }
    },
    [gene.chromosome],
  );

  useEffect(() => {
    const geneDetailData = async () => {
      setError(null);

      setGeneDetail(null);

      setGeneSequence("");
      setActualRange(null);

      setStartPosition("");
      setEndPosition("");

      if (!gene.gene_id) {
        setError("Gene ID is missing , can not fetch detail ");
        return;
      }

      try {
        const {
          geneDetails: fetchedGeneDeatils,
          geneBounds: fetchedGeneBounds,
          initialRange: fetchedGeneRange,
        } = await fetchGeneDetails(gene.gene_id);

        setGeneDetail(fetchedGeneDeatils);

        setGeneBounds(fetchedGeneBounds);

        if (fetchedGeneRange) {
          setStartPosition(String(fetchedGeneRange.start));
          setEndPosition(String(fetchedGeneRange.end));

          // fetch gene Sequence
          await fetchGeneSequence(fetchedGeneRange.start, fetchedGeneRange.end);
          //console.log(fetchedGeneDeatils)
        }
      } catch (detailError) {
        setError(
          detailError instanceof Error
            ? detailError.message
            : "Failed to load gene information",
        );
      }
    };

    void geneDetailData();
  }, [gene, fetchGeneSequence]);

  const handleLoadSequence = useCallback(() => {
    const start = parseInt(startPosition);
    const end = parseInt(endPosition);
    let validationError: string | null = null;

    if (isNaN(start) || isNaN(end)) {
      validationError = "Please enter valid start and end positions";
    } else if (start > end) {
      validationError = "Start position must not exceed end position";
    } else if (geneBounds) {
      const minBound = Math.min(geneBounds.min, geneBounds.max);
      const maxBound = Math.max(geneBounds.min, geneBounds.max);
      if (start < minBound) {
        validationError = `Start position (${start.toLocaleString()}) is below the minimum value (${minBound.toLocaleString()})`;
      } else if (end > maxBound) {
        validationError = `End position (${end.toLocaleString()}) exceeds the maximum value (${maxBound.toLocaleString()})`;
      }

      if (end - start + 1 > 10000) {
        validationError = "Selected range exceeds the 10,000 bp view limit";
      }
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    void fetchGeneSequence(start, end);
  }, [startPosition, endPosition, fetchGeneSequence, geneBounds]);

  const sequenceRange = actualRange
    ? { start: actualRange.startpos, end: actualRange.endpos }
    : null;

  const updateClinvarVariant = (
    clinvar_id: string,
    updateVariant: ClinvarVariant,
  ) => {
    setClinvarVariants((currentVariants) =>
      currentVariants.map((v) =>
        v.clinvar_id === clinvar_id ? updateVariant : v,
      ),
    );
  };

  const fetchClinvarVariants = useCallback(async () => {
    if (!geneBounds || !gene.chromosome) {
      return;
    }

    setIsLoadingClinvar(true);
    setErrorClinvar(null);

    try {
      const variants = await apiFetchClinvarVariants(
        gene.chromosome,
        geneBounds,
      );
      setClinvarVariants(variants);
    } catch (variantError) {
      setErrorClinvar(
        variantError instanceof Error
          ? variantError.message
          : "Failed to load ClinVar variants",
      );
      setClinvarVariants([]);
    } finally {
      setIsLoadingClinvar(false);
    }
  }, [gene.chromosome, geneBounds]);

  useEffect(() => {
    if (geneBounds && gene.chromosome) {
      const timer = window.setTimeout(() => {
        void fetchClinvarVariants();
      }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [fetchClinvarVariants, geneBounds, gene.chromosome]);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="cursor-pointer text-[#3c4f3d] hover:bg-[#e9eeea]/70"
        onClick={onClose}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to results
      </Button>

      <GeneInformation
        gene={gene}
        geneDetail={geneDetail}
        geneBounds={geneBounds}
      />

      <KnownVariants
        refreshVariants={fetchClinvarVariants}
        updateVariant={updateClinvarVariant}
        variants={clinvarVariants}
        isLoading={isLoadingClinvar}
        error={errorClinvar}
      />

      <GeneSequence
        geneBounds={geneBounds}
        geneDetail={geneDetail}
        startPosition={startPosition}
        endPosition={endPosition}
        onStartPositionChange={setStartPosition}
        onEndPositionChange={setEndPosition}
        sequenceData={geneSequence}
        sequenceRange={sequenceRange}
        isLoading={isLoadingSequence}
        error={error}
        onSequenceLoadRequest={handleLoadSequence}
        onSequenceClick={(position, nucleotide) =>
          setSelectedBase({ position, nucleotide })
        }
        maxViewRange={10000}
      />

      <VariantAnalysisDialog
        key={`${selectedBase?.position ?? "none"}-${selectedBase?.nucleotide ?? "none"}`}
        open={selectedBase !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBase(null);
        }}
        chromosome={gene.chromosome}
        position={selectedBase?.position ?? null}
        reference={selectedBase?.nucleotide ?? null}
      />
    </div>
  );
}
