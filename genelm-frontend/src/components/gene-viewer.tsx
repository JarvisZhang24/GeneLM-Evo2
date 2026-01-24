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
import { GeneInformation } from "./gene-information";
import { GeneSequence } from "./gene-sequence";

export default function GeneViewer({
  gene,
  genomeId,
  onClose,
}: {
  gene: SingleGeneInfo;
  genomeId: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchGeneSequence = useCallback(
    async (start: number, end: number) => {
      try {
        setIsLoadingSequence(true);
        setError(null);
        const {
          sequence,
          actualRange: fetchedRange,
          error: apiError,
        } = await apiFetchGeneSequence(gene.chromosome, start, end, genomeId);

        setGeneSequence(sequence);

        setActualRange(fetchedRange);

        if (apiError) {
          setError(apiError);
        }

        //console.log(sequence)
      } catch (error) {
        setError("failed to load sequence data");
      } finally {
        setIsLoadingSequence(false);
      }
    },
    [gene.chromosome, genomeId],
  );

  useEffect(() => {
    const geneDetailData = async () => {
      setIsLoading(true);
      setError(null);

      setGeneDetail(null);

      setGeneSequence("");
      setActualRange(null);

      setStartPosition("");
      setEndPosition("");

      if (!gene.gene_id) {
        setError("Gene ID is missing , can not fetch detail ");
        setIsLoading(false);
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
      } catch (error) {
        setError("faield to load gene information , please try again!");
      } finally {
        setIsLoading(false);
      }
    };

    geneDetailData();
  }, [gene, fetchGeneSequence]);

  const handleLoadSequence = useCallback(() => {
    const start = parseInt(startPosition);
    const end = parseInt(endPosition);
    let validationError: string | null = null;

    if (isNaN(start) || isNaN(end)) {
      validationError = "Please enter valid start and end positions";
    } else if (start >= end) {
      validationError = "Start position must be less than end position";
    } else if (geneBounds) {
      const minBound = Math.min(geneBounds.min, geneBounds.max);
      const maxBound = Math.max(geneBounds.min, geneBounds.max);
      if (start < minBound) {
        validationError = `Start position (${start.toLocaleString()}) is below the minimum value (${minBound.toLocaleString()})`;
      } else if (end > maxBound) {
        validationError = `End position (${end.toLocaleString()}) exceeds the maximum value (${maxBound.toLocaleString()})`;
      }

      if (end - start > 10000) {
        validationError = `Selected range exceeds maximum view range of 10.000 bp.`;
      }
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    fetchGeneSequence(start, end);
  }, [startPosition, endPosition, fetchGeneSequence, geneBounds]);

  const sequenceRange = actualRange
    ? { start: actualRange.startpos, end: actualRange.endpos }
    : null;

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
        onSequenceClick={() => {}}
        maxViewRange={10000}
      />
    </div>
  );
}
