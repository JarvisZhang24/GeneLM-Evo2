import type {
  GeneBounds,
  GeneDetailsFromSearch,
} from "~/utils/gene-details-api";
import type { SingleGeneInfo } from "~/utils/genes-api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ArrowLeft,
  Dna,
  MapPin,
  Tag,
  PersonStanding,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Hash,
  Download,
  BarChart3,
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
  return (
    <div>
      <Card className="overflow-hidden border-slate-200">
        {/* Header: icon + symbol */}
        <div className="bg-linear-to-r from-emerald-500 to-teal-500 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Dna className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl leading-tight font-semibold text-white">
              {gene.symbol || "Unknown Gene"}
            </h1>
          </div>
        </div>
        {/* Description strip */}
        {gene.description && (
          <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-2">
            <p className="text-l line-clamp-2 text-emerald-800">
              {gene.description}
            </p>
          </div>
        )}
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Hash className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Gene ID</p>
              <p className="font-mono font-semibold text-slate-900">
                {gene.gene_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <MapPin className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Chromosome</p>
              <p className="font-semibold text-slate-900">
                {gene.chromsome || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
              <Tag className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Gene Type</p>
              <p className="font-semibold text-slate-900">
                {gene.type_of_gene || "N/A"}
              </p>
            </div>
          </div>
          {/* Organism */}
          {geneDetail?.organism && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <PersonStanding className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Organism</p>
                <p className="font-semibold text-slate-900">
                  {geneDetail.organism.scientificname}
                  {geneDetail.organism.commonname &&
                    ` (${geneDetail.organism.commonname})`}
                </p>
              </div>
            </div>
          )}
          {geneBounds && (
            <>
              {/* Length */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Dna className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Length</p>
                  <p className="font-mono font-semibold text-slate-900">
                    {(geneBounds.max - geneBounds.min).toLocaleString()} bp
                  </p>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Position</p>
                  <p className="font-mono font-semibold text-slate-900">
                    {geneBounds.min.toLocaleString()} –{" "}
                    {geneBounds.max.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-3">
            {gene.gene_id && (
              <>
                <a
                  href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  NCBI Gene
                </a>

                <a
                  href={`http://mygene.info/v3/gene/${gene.gene_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  MyGene.info
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {geneDetail?.summary && (
        <Card className="border-slate-200">
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
