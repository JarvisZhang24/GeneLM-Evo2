"use client";

import { useState } from "react";
import { Loader2, Sparkles, TriangleAlert } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  analyzeVariantWithAPI,
  type AnalysisResult,
} from "~/utils/variants-api";

type DnaBase = "A" | "C" | "G" | "T";
const bases: DnaBase[] = ["A", "C", "G", "T"];

export function VariantAnalysisDialog({
  open,
  onOpenChange,
  chromosome,
  position,
  reference,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chromosome: string;
  position: number | null;
  reference: string | null;
}) {
  const [alternate, setAlternate] = useState<DnaBase | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const normalizedReference = reference?.toUpperCase() as DnaBase | undefined;
  const submit = async () => {
    if (!position || !alternate || !normalizedReference) return;
    setLoading(true);
    setError(null);
    try {
      setResult(
        await analyzeVariantWithAPI({
          position,
          reference: normalizedReference,
          alternative: alternate,
          chromosome,
        }),
      );
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Analysis failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Score a GRCh38 single-nucleotide variant</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
            <div>
              <span className="text-slate-500">Position</span>
              <p className="font-mono font-bold">
                {chromosome}:{position?.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Reference</span>
              <p className="font-mono font-bold">{normalizedReference}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Choose alternate allele
            </p>
            <div className="grid grid-cols-4 gap-2">
              {bases.map((base) => (
                <Button
                  key={base}
                  variant={alternate === base ? "default" : "outline"}
                  disabled={base === normalizedReference}
                  onClick={() => setAlternate(base)}
                >
                  {base}
                </Button>
              ))}
            </div>
          </div>
          {result ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-800">
                Evo2-7B delta likelihood (alternate − reference)
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-950">
                {result.delta_likelihood.toExponential(6)}
              </p>
              <p className="mt-2 text-xs text-emerald-900/70">
                A model likelihood difference, not a pathogenicity probability.
              </p>
            </div>
          ) : null}
          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div className="flex items-start gap-2 text-xs text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Research use
            only; do not use for diagnosis or treatment.
          </div>
          <Button
            className="w-full bg-[#3c4f3d] text-white hover:bg-[#2d3f2e]"
            disabled={!alternate || loading}
            onClick={() => void submit()}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Score with Evo2
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
