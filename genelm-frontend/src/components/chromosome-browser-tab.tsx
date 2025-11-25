"use client";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Dna } from "lucide-react";
import type { SingleChromosomeInfo } from "~/utils/chromosomes-api";
import type { SingleGeneInfo } from "~/utils/genes-api";

interface ChromosomeBrowserTabProps {
  chromosomes: SingleChromosomeInfo[];
  selectedChromosome: string;
  onSelectChromosome: (chrom: string) => void;
  geneResults: SingleGeneInfo[];
  isLoading: boolean;
  onGeneClick: (gene: SingleGeneInfo) => void;
}

export function ChromosomeBrowserTab({
  chromosomes,
  selectedChromosome,
  onSelectChromosome,
  geneResults,
  isLoading,
  onGeneClick,
}: ChromosomeBrowserTabProps) {
  const filteredChromosomes = chromosomes.filter((c) =>
    c.name.startsWith("chr"),
  );

  return (
    <div className="animate-in fade-in-50 space-y-8 duration-300">
      {/* Chromosome Selector */}
      <div className="rounded-xl border border-slate-200 bg-linear-to-r from-white to-slate-50/50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
            <Dna className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-900">
            Select Chromosome
          </h3>
        </div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
          {filteredChromosomes.map((chrom) => (
            <Button
              key={chrom.name}
              variant="outline"
              size="sm"
              onClick={() => onSelectChromosome(chrom.name)}
              className={`w-full transition-all ${
                selectedChromosome === chrom.name
                  ? "scale-105 transform border-emerald-500 bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 hover:text-white"
                  : "border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {chrom.name.replace("chr", "")}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      {selectedChromosome && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-md shadow-emerald-500/10">
                <span className="text-sm font-bold text-emerald-700">
                  {selectedChromosome.replace("chr", "")}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Chromosome {selectedChromosome.replace("chr", "")}
                </h3>
                <p className="text-xs text-slate-500">
                  Gene list for selected chromosome
                </p>
              </div>
            </div>
            {!isLoading && geneResults.length > 0 && (
              <span className="rounded-full bg-linear-to-r from-emerald-50 to-teal-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                {geneResults.length} Genes Found
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="space-y-0">
                <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-slate-100 px-4 py-3 last:border-0"
                  >
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : geneResults.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      
                      <TableHead className="w-[150px] font-semibold text-slate-900">
                        Gene ID
                      </TableHead>
                      <TableHead className="w-[120px] font-semibold text-slate-900">
                        Chromosome
                      </TableHead>
                      <TableHead className="font-semibold text-slate-900">
                        Type                       
                      </TableHead>
                      <TableHead className="font-semibold text-slate-900">
                        Description
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geneResults.map((gene, index) => (
                      <TableRow
                        key={`${gene.symbol}-${index}`}
                        className="group cursor-pointer transition-colors hover:bg-emerald-50/50"
                        onClick={() => onGeneClick(gene)}
                      >                       
                        <TableCell className="font-semibold text-emerald-700 group-hover:text-emerald-800">
                          {gene.gene_id}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {gene.chromsome}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {gene.type_of_gene}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-xs text-slate-600">
                          {gene.description || "-"}
                        </TableCell>
                        
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                  <Dna className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500">
                  No genes found for this chromosome region.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
