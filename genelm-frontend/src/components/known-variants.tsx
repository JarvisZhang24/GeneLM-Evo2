"use client";

import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  analyzeVariantWithAPI,
  resolveClinvarSnv,
  type ClinvarVariant,
} from "~/utils/variants-api";
import { getClassificationColorClasses } from "~/utils/coloring-utils";

interface KnownVariantsProps {
  variants: ClinvarVariant[];
  isLoading: boolean;
  error: string | null;
  refreshVariants: () => Promise<void>;
  updateVariant: (id: string, variant: ClinvarVariant) => void;
}

export default function KnownVariants({
  variants,
  isLoading,
  error,
  refreshVariants,
  updateVariant,
}: KnownVariantsProps) {
  const analyze = async (variant: ClinvarVariant) => {
    updateVariant(variant.clinvar_id, {
      ...variant,
      isAnalyzing: true,
      evo2Error: undefined,
    });
    try {
      const snv = await resolveClinvarSnv(variant);
      const result = await analyzeVariantWithAPI({
        position: snv.position,
        reference: snv.reference,
        alternative: snv.alternative,
        chromosome: variant.chromosome,
      });
      updateVariant(variant.clinvar_id, {
        ...variant,
        isAnalyzing: false,
        evo2Result: result,
      });
    } catch (analysisError) {
      updateVariant(variant.clinvar_id, {
        ...variant,
        isAnalyzing: false,
        evo2Error:
          analysisError instanceof Error
            ? analysisError.message
            : "Analysis failed",
      });
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3c4f3d]" />
              <CardTitle>ClinVar variants and Evo2 scores</CardTitle>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Clinical significance comes from ClinVar. Evo2 reports only a
              reference-versus-alternate likelihood difference.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => void refreshVariants()}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Research use only. Delta likelihood is not a pathogenicity label,
            calibrated probability, or medical recommendation.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading ClinVar
            records…
          </div>
        ) : error ? (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : variants.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No ClinVar records were returned for this gene interval.
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant) => (
              <article
                key={variant.clinvar_id}
                className="rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={getClassificationColorClasses(
                          variant.classification,
                        )}
                      >
                        ClinVar: {variant.classification}
                      </Badge>
                      <Badge variant="outline">{variant.variation_type}</Badge>
                      <span className="font-mono text-xs text-slate-500">
                        {variant.chromosome}:{variant.location}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium break-words text-slate-800">
                      {variant.title}
                    </p>
                    <a
                      className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                      href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvar_id}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ClinVar {variant.clinvar_id}{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="w-full rounded-lg bg-slate-50 p-3 lg:w-72">
                    {variant.evo2Result ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Evo2-7B delta likelihood
                        </p>
                        <p className="mt-1 font-mono text-xl font-bold text-slate-900">
                          {variant.evo2Result.delta_likelihood.toExponential(4)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {variant.evo2Result.reference}→
                          {variant.evo2Result.alternate}; alt − ref
                        </p>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-[#3c4f3d] text-white hover:bg-[#2d3f2e]"
                        disabled={variant.isAnalyzing}
                        onClick={() => void analyze(variant)}
                      >
                        {variant.isAnalyzing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Score SNV with Evo2
                      </Button>
                    )}
                    {variant.evo2Error ? (
                      <p className="mt-2 text-xs text-red-700">
                        {variant.evo2Error}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
