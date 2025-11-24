"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dna,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Tag,
  Hash,
} from "lucide-react";
import { useState } from "react";
import type { SingleGeneInfo } from "~/utils/genes-api";

interface GeneDetailDialogProps {
  gene: SingleGeneInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneDetailDialog({
  gene,
  open,
  onOpenChange,
}: GeneDetailDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!gene) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-slate-200 bg-white/95 backdrop-blur-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-lg shadow-emerald-500/10">
              <Dna className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {gene.symbol}
              </h2>
              <p className="text-sm font-normal text-slate-500">
                {gene.HGNC_ID || "Gene Details"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {gene.description && (
            <div className="rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 to-white p-4">
              <p className="text-sm leading-relaxed text-slate-700">
                {gene.description}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Chromosome
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{gene.chrom}</p>
            </div>

            {gene.type_of_gene && (
              <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-teal-200 hover:shadow-md hover:shadow-teal-500/5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100">
                    <Tag className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    Type
                  </span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {gene.type_of_gene}
                </p>
              </div>
            )}

            {gene.gene_id && (
              <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-500/5 sm:col-span-2">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                    <Hash className="h-4 w-4 text-cyan-600" />
                  </div>
                  <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    NCBI ID
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-base font-semibold break-all text-slate-900">
                    {gene.gene_id}
                  </p>
                  <button
                    onClick={() => copyToClipboard(gene.gene_id!)}
                    className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* External Resources */}
          <Card className="border-slate-200 bg-linear-to-br from-slate-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200">
                  <ExternalLink className="h-4 w-4 text-slate-600" />
                </div>
                External Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                Explore more about{" "}
                <strong className="text-emerald-700">{gene.symbol}</strong>{" "}
                using external databases:
              </p>
              <div className="flex flex-wrap gap-2">
                {gene.gene_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id.replace(/^LOC/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      NCBI Gene
                    </a>
                  </Button>
                )}
                {gene.symbol && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  >
                    <a
                      href={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      GeneCards
                    </a>
                  </Button>
                )}
                {gene.symbol && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                  >
                    <a
                      href={`https://www.uniprot.org/uniprotkb?query=${gene.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      UniProt
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          
        </div>
      </DialogContent>
    </Dialog>
  );
}
