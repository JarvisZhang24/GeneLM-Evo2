"use client";

import type { SingleGeneInfo } from "~/utils/genes-api";
import type { ClinvarVariant } from "~/utils/variants-api";
import { analyzeVariantWithAPI } from "~/utils/variants-api";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  BarChart2,
  ExternalLink,
  RefreshCw,
  Search,
  Shield,
  Zap,
  AlertTriangle,
  Database,
  Activity,
  FileText,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { getClassificationColorClasses } from "~/utils/coloring-utils";
import { motion } from "framer-motion";

interface KnownVariantsProps {
  refreshVariants: () => void;
  showComparison: (variant: ClinvarVariant) => void;
  updateVariant: (id: string, newVariant: ClinvarVariant) => void;
  variants: ClinvarVariant[];
  isLoading: boolean;
  error: string | null;
  genomeId: string;
  gene: SingleGeneInfo;
}

export default function KnownVariants({
  refreshVariants,
  showComparison,
  updateVariant,
  variants,
  isLoading,
  error,
  genomeId,
  gene,
}: KnownVariantsProps) {
  const pathogenicCount = variants.filter(
    (v) =>
      v.classification?.toLowerCase().includes("pathogenic") &&
      !v.classification?.toLowerCase().includes("benign"),
  ).length;

  const benignCount = variants.filter((v) =>
    v.classification?.toLowerCase().includes("benign"),
  ).length;

  const uncertainCount = variants.filter(
    (v) =>
      v.classification?.toLowerCase().includes("uncertain") ||
      v.classification?.toLowerCase().includes("vus"),
  ).length;

  const snvCount = variants.filter((v) =>
    v.variation_type?.toLowerCase().includes("single nucleotide"),
  ).length;

  const analyzeVariant = async (variant: ClinvarVariant) => {
    let variantDetails = null;
    const position = variant.location
      ? parseInt(variant.location.replaceAll(",", ""))
      : null;

    const refAltMatch = variant.title.match(/(\w)>(\w)/);

    if (refAltMatch && refAltMatch.length === 3) {
      variantDetails = {
        position,
        reference: refAltMatch[1],
        alternative: refAltMatch[2],
      };
    }

    if (
      !variantDetails ||
      !variantDetails.position ||
      !variantDetails.reference ||
      !variantDetails.alternative
    ) {
      return;
    }

    updateVariant(variant.clinvar_id, {
      ...variant,
      isAnalyzing: true,
    });

    try {
      const data = await analyzeVariantWithAPI({
        position: variantDetails.position,
        alternative: variantDetails.alternative,
        genomeId: genomeId,
        chromosome: gene.chromosome,
      });

      const updatedVariant: ClinvarVariant = {
        ...variant,
        isAnalyzing: false,
        evo2Result: data,
      };

      updateVariant(variant.clinvar_id, updatedVariant);

      showComparison(updatedVariant);
    } catch (error) {
      updateVariant(variant.clinvar_id, {
        ...variant,
        isAnalyzing: false,
        evo2Error: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  };

  return (
    <Card className="relative overflow-hidden border-emerald-200/70 bg-white shadow-lg ring-1 ring-emerald-100/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-lime-400 to-amber-400" />
      {/* Evo2 Spotlight Header */}
      <div className="border-b border-emerald-200/60 bg-linear-to-b from-white via-emerald-50/30 to-white px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#203123] text-white shadow-md ring-1 ring-[#203123]/20">
              <Zap className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-none bg-[#203123] px-2 py-0 text-[10px] font-black tracking-widest text-white uppercase">
                  Evo2 Core
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-200/70 bg-white px-2 py-0 text-[10px] font-semibold text-emerald-700"
                >
                  ClinVar curated
                </Badge>
              </div>
              <h2 className="text-xl font-black tracking-tight text-[#1f2f20]">
                Evo2 Variant Intelligence
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Large-model inference for clinically curated SNVs with instant
                comparison.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                <Badge
                  variant="outline"
                  className="border-emerald-200/60 bg-white px-2 py-0 font-semibold text-emerald-700"
                >
                  {gene.symbol || "Unknown Gene"}
                </Badge>
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  ClinVar evidence
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {snvCount} SNVs ready
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-2.5 text-center">
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                Evo2 Ready
              </span>
              <div className="font-mono text-lg font-black text-emerald-700">
                {snvCount}
              </div>
              <div className="text-[10px] font-semibold text-emerald-700/70">
                SNVs
              </div>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-slate-100/70 px-4 py-2">
              <span className="text-[10px] font-bold tracking-widest text-[#3c4f3d]/60 uppercase">
                Total
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {variants.length}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshVariants}
              disabled={isLoading}
              className="h-9 cursor-pointer border-emerald-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 rounded-2xl border border-emerald-200/60 bg-linear-to-r from-emerald-50 via-white to-lime-50 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                <Zap className="h-3.5 w-3.5" />
                Evo2 Large Model Analysis
              </div>
              <h3 className="mt-2 text-base font-black text-slate-900">
                Instant pathogenicity prediction for ClinVar SNVs
              </h3>
              <p className="mt-1 max-w-xl text-xs font-semibold text-slate-600">
                Prioritize high-risk variants, compare against ClinVar labels,
                and surface Evo2 predictions in one view.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="border-none bg-emerald-100/70 text-[10px] font-semibold text-emerald-700"
                >
                  SNV-ready: {snvCount}
                </Badge>
                <Badge
                  variant="secondary"
                  className="border-none bg-slate-100 text-[10px] font-semibold text-slate-600"
                >
                  AI confidence tiers
                </Badge>
                <Badge
                  variant="secondary"
                  className="border-none bg-slate-100 text-[10px] font-semibold text-slate-600"
                >
                  ClinVar vs Evo2 comparison
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-white/80 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#203123] text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                  Evo2 Engine
                </p>
                <p className="text-sm font-bold text-slate-900">
                  One-click AI analysis
                </p>
                <p className="text-[11px] font-semibold text-slate-600">
                  {snvCount} SNVs ready now
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {variants.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Pathogenic
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                </div>
              </div>
              <div className="mt-2 font-mono text-xl font-bold text-red-600">
                {pathogenicCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Benign
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                  <Shield className="h-3.5 w-3.5 text-green-600" />
                </div>
              </div>
              <div className="mt-2 font-mono text-xl font-bold text-green-600">
                {benignCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Uncertain (VUS)
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 font-mono text-xl font-bold text-amber-600">
                {uncertainCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  SNVs (Evo2 Ready)
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3c4f3d]/10">
                  <Zap className="h-3.5 w-3.5 text-[#3c4f3d]" />
                </div>
              </div>
              <div className="mt-2 font-mono text-xl font-bold text-[#3c4f3d]">
                {snvCount}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-200/60 bg-red-50 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 font-bold text-red-600">
              !
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">
                Error Loading Variants
              </p>
              <p className="text-xs font-medium text-red-600/80">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/30 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#3c4f3d]" />
            <p className="mt-4 text-xs font-semibold text-slate-600">
              Fetching variants from ClinVar…
            </p>
          </div>
        ) : variants.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200/70">
            {/* Table Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/90 px-5 py-3">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Variant List
                </span>
                <Badge
                  variant="secondary"
                  className="border-none bg-slate-100 font-mono text-[10px] text-slate-700"
                >
                  {variants.length} variants
                </Badge>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="max-h-[420px] overflow-y-auto bg-slate-50/30">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="border-b border-slate-200/60 bg-slate-100/80 hover:bg-slate-100/80">
                    <TableHead className="px-5 py-3 text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                      Variant &amp; Position
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                      Variant Type
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                      Clinical Significance
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => {
                    const refAltMatch =
                      variant.title.match(/([ACGT])>([ACGT])/i);
                    const refAltLabel = refAltMatch
                      ? `${refAltMatch[1]!.toUpperCase()}→${refAltMatch[2]!.toUpperCase()}`
                      : null;
                    const locationLabel = variant.location
                      ? `chr${variant.chromosome}:${variant.location}`
                      : "Location unavailable";
                    const geneLabel = variant.gene_sort
                      ? variant.gene_sort.replaceAll("|", ", ")
                      : null;

                    return (
                      <TableRow
                        key={variant.clinvar_id}
                        className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50/60"
                      >
                        <TableCell className="px-5 py-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-base leading-snug font-bold text-slate-900">
                                {variant.title}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                ClinVar ID: {variant.clinvar_id}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/70 bg-emerald-50 px-2 py-1 font-mono text-xs font-semibold text-emerald-700">
                                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                {locationLabel}
                              </span>
                              {refAltLabel ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                                  Ref/Alt: {refAltLabel}
                                </span>
                              ) : null}
                              {geneLabel ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                                  Gene: {geneLabel}
                                </span>
                              ) : null}
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvar_id}`,
                                    "_blank",
                                  )
                                }
                                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                              >
                                <ExternalLink className="h-3 w-3" />
                                ClinVar
                              </button>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              Variant type
                            </p>
                            <Badge
                              variant="outline"
                              className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                            >
                              {variant.variation_type}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                ClinVar
                              </p>
                              <div
                                className={`mt-1 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold ${getClassificationColorClasses(variant.classification)}`}
                              >
                                {variant.classification || "Unknown"}
                              </div>
                            </div>
                            {variant.evo2Result && (
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                                  Evo2 Analysis
                                </p>
                                <div
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${getClassificationColorClasses(variant.evo2Result.prediction)}`}
                                >
                                  <Shield className="h-3.5 w-3.5" />
                                  <span>{variant.evo2Result.prediction}</span>
                                </div>
                                <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500">
                                      Genomic Ref→Alt:
                                    </span>
                                    <span className="font-mono font-bold text-slate-900">
                                      {variant.evo2Result.reference}→
                                      {variant.evo2Result.variant}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500">
                                      Delta Score:
                                    </span>
                                    <span
                                      className={`font-mono font-bold ${variant.evo2Result.delta_score < 0 ? "text-red-600" : "text-emerald-600"}`}
                                    >
                                      {variant.evo2Result.delta_score.toExponential(
                                        2,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500">
                                      Confidence:
                                    </span>
                                    <span className="font-mono font-bold text-slate-900">
                                      {(
                                        variant.evo2Result.confidence * 100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                </div>
                                {refAltMatch &&
                                  variant.evo2Result.reference !==
                                    refAltMatch[1]?.toUpperCase() && (
                                    <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-700">
                                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                      <span>
                                        <strong>Note:</strong> ClinVar shows
                                        cDNA ref (
                                        {refAltMatch[1]?.toUpperCase()}), but
                                        genomic ref is{" "}
                                        {variant.evo2Result.reference}. This is
                                        normal for minus-strand genes.
                                      </span>
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-4 text-right">
                          {variant.variation_type
                            .toLowerCase()
                            .includes("single nucleotide") ? (
                            !variant.evo2Result ? (
                              <Button
                                size="sm"
                                className="h-9 cursor-pointer bg-linear-to-r from-emerald-700 to-[#3c4f3d] px-4 text-xs font-bold text-white shadow-sm ring-1 ring-emerald-200/50 transition-all hover:from-emerald-600 hover:to-[#2d3f2e]"
                                disabled={variant.isAnalyzing}
                                onClick={() => analyzeVariant(variant)}
                              >
                                {variant.isAnalyzing ? (
                                  <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="mr-2 h-3.5 w-3.5" />
                                    Analyze with Evo2
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 cursor-pointer border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                                onClick={() => showComparison(variant)}
                              >
                                <BarChart2 className="mr-2 h-3.5 w-3.5" />
                                Compare Results
                              </Button>
                            )
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">
                              SNV only
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/30 py-24 text-slate-300">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <Search className="h-10 w-10 opacity-20" />
            </div>
            <p className="text-base font-bold text-slate-400">
              No ClinVar variants found
            </p>
            <p className="mt-2 max-w-xs text-center text-xs leading-relaxed font-medium text-slate-400">
              No known clinical variants were found for this gene in the ClinVar
              database.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
