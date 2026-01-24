import type {
  GeneBounds,
  GeneDetailsFromSearch,
} from "~/utils/gene-details-api";
import type { SingleGeneInfo } from "~/utils/genes-api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dna,
  MapPin,
  Tag,
  PersonStanding,
  ExternalLink,
  Hash,
} from "lucide-react";

export function GeneInformation({
  gene,
  geneDetail,
  geneBounds,
}: {
  gene: SingleGeneInfo;
  geneDetail: GeneDetailsFromSearch | null;
  geneBounds: GeneBounds | null;
}) {
  const geneLengthBp = geneBounds
    ? Math.abs(geneBounds.max - geneBounds.min) + 1
    : null;

  return (
    <div>
      <Card className="overflow-hidden border-slate-200/70 bg-white shadow-sm">
        {/* Header: icon + symbol */}
        <div className="border-b border-slate-200/60 bg-linear-to-b from-white to-slate-50/60 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3c4f3d] text-white shadow-sm ring-1 ring-[#3c4f3d]/10">
                <Dna className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  {gene.symbol || "Unknown Gene"}
                </h1>
                {gene.description ? (
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    {gene.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {gene.gene_id ? (
                <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  {gene.gene_id}
                </span>
              ) : null}
              {gene.chromosome ? (
                <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {gene.chromosome}
                </span>
              ) : null}
              {gene.type_of_gene ? (
                <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  {gene.type_of_gene}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {/* Description strip */}
        {gene.description && null}
        <CardContent className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Gene ID
              </div>
              <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                {gene.gene_id || "N/A"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Chromosome
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {gene.chromosome || "N/A"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Gene Type
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {gene.type_of_gene || "N/A"}
              </div>
            </div>

            {/* Organism */}
            <div className="rounded-xl border border-slate-200/70 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Organism
                </div>
                <PersonStanding className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {geneDetail?.organism?.scientificname || "N/A"}
              </div>
              {geneDetail?.organism?.commonname ? (
                <div className="mt-0.5 text-xs font-medium text-slate-600">
                  {geneDetail.organism.commonname}
                </div>
              ) : null}
            </div>
          </div>

          {geneBounds && (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {/* Length */}
              <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Length
                </div>
                <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                  {geneLengthBp?.toLocaleString()} bp
                </div>
              </div>

              {/* Position */}
              <div className="rounded-xl border border-slate-200/70 bg-white p-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    Genomic Position
                  </div>
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                  {geneBounds.min.toLocaleString()} –{" "}
                  {geneBounds.max.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {gene.gene_id ? (
              <>
                <a
                  href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  NCBI Gene
                </a>

                <a
                  href={`http://mygene.info/v3/gene/${gene.gene_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  MyGene.info
                </a>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {geneDetail?.summary && (
        <Card className="mt-6 border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-600">
              {geneDetail.summary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
