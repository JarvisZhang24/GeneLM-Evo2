"use client";

import { useState } from "react";
import { Search, Dna, Activity, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import type { SingleGeneInfo } from "~/utils/genes-api";

interface GeneSearchTabProps {
  isLoading: boolean;
  searchResults: SingleGeneInfo[];
  onSearch: (query: string) => void;
  onGeneClick: (gene: SingleGeneInfo) => void;
}

export function GeneSearchTab({
  isLoading,
  searchResults,
  onSearch,
  onGeneClick,
}: GeneSearchTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearch(searchQuery);
  };

  const loadExample = () => {
    const example = "BRCA1";
    setSearchQuery(example);
    onSearch(example);
  };

  return (
    <div className="animate-in fade-in-50 duration-300">
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="flex flex-col gap-4">
            <div className="mb-2 text-center">
              <h3 className="text-sm font-medium text-slate-900">
                Search Genes
              </h3>
              <p className="text-xs text-slate-500">
                Find genes by symbol or name across the genome
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Enter gene symbol (e.g. BRCA1, TP53)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-slate-200 pl-12 text-base shadow-sm focus-visible:ring-emerald-500"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 bg-linear-to-r from-emerald-600 to-teal-600 px-8 font-medium text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50"
                disabled={isLoading || !searchQuery.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[150px]">
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-12" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-linear-to-br from-emerald-50 to-teal-50 p-5">
            <Dna className="h-10 w-10 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {searchQuery ? "No genes found" : "Start exploring"}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            {searchQuery
              ? `We couldn't find any genes matching "${searchQuery}". Please try a different symbol or check the spelling.`
              : "Enter a gene symbol above to search across the selected genome assembly."}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              className="mt-6 border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={loadExample}
            >
              <Activity className="mr-2 h-4 w-4" />
              Try "BRCA1" Example
            </Button>
          )}
        </div>
      )}

      {/* Results Table */}
      {searchResults.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-medium text-slate-700">
              Found{" "}
              <span className="font-bold text-emerald-600">
                {searchResults.length}
              </span>{" "}
              results
            </h3>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
                {searchResults.map((gene, index) => (
                  <TableRow
                    key={`${gene.symbol}-${index}`}
                    className="cursor-pointer transition-colors hover:bg-emerald-50/50"
                    onClick={() => onGeneClick(gene)}
                  >
                    
                    <TableCell className="font-semibold text-emerald-700">
                      {gene.gene_id}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {gene.chromsome}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {gene.type_of_gene}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {gene.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
