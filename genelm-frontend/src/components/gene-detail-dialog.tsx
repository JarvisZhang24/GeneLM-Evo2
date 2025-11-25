"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Dna,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Tag,
  Hash,
  ArrowRight,
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
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-slate-200 bg-white p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Dna className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-900">
                {gene.symbol}
              </h2>
              <span className="text-xs text-slate-500">
                Gene ID: {gene.gene_id}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {/* Description */}
          {gene.description && (
            <p className="text-sm leading-relaxed text-slate-600">
              {gene.description}
            </p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-slate-500">
                  Chromosome
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {gene.chromsome}
              </p>
            </div>

            {gene.type_of_gene && (
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-xs font-medium text-slate-500">
                    Type
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {gene.type_of_gene}
                </p>
              </div>
            )}
          </div>

          {/* Copy Gene ID */}
          {gene.gene_id && (
            <button
              onClick={() => copyToClipboard(gene.gene_id)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-cyan-600" />
                <span className="font-mono text-sm font-medium text-slate-700">
                  {gene.gene_id}
                </span>
              </div>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400" />
              )}
            </button>
          )}

          {/* External Links */}
          <div className="flex gap-2">
            {gene.gene_id && (
              <a
                href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                NCBI
              </a>
            )}
            {gene.gene_id && (
              <a
                href={`http://mygene.info/v3/gene/${gene.gene_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                MyGene
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white"
            onClick={() => {
              window.location.href = `/gene/${gene.gene_id}`;
            }}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Analysis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
