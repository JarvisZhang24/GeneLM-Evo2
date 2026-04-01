"use client";
export const runtime = 'edge';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import GeneViewer from "~/components/gene-viewer";
import type { SingleGeneInfo } from "~/utils/genes-api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

async function fetchGeneMetadata(geneId: string): Promise<SingleGeneInfo | null> {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneId}&retmode=json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const detail = data?.result?.[geneId];
    if (!detail) return null;

    let chrom = detail.chromosome || "";
    if (chrom && !chrom.startsWith("chr")) {
      chrom = `chr${chrom}`;
    }

    return {
      gene_id: geneId,
      symbol: detail.name || detail.nomenclaturesymbol || "",
      chromosome: chrom,
      description: detail.description || detail.nomenclaturename || "",
      type_of_gene: detail.type_of_gene ?? "",
    };
  } catch {
    return null;
  }
}

export default function GeneAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const geneId = params.id as string;

  const [gene, setGene] = useState<SingleGeneInfo | null>(null);
  const [genomeId, setGenomeId] = useState<string>("hg38");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadGene = async () => {
      // Try sessionStorage first (navigated from /analyze)
      const storedGene = sessionStorage.getItem("selectedGene");
      const storedGenomeId = sessionStorage.getItem("selectedGenomeId");

      if (storedGene) {
        try {
          const parsedGene = JSON.parse(storedGene) as SingleGeneInfo;
          if (parsedGene.gene_id === geneId) {
            setGene(parsedGene);
            if (storedGenomeId) setGenomeId(storedGenomeId);
            setIsLoading(false);
            return;
          }
        } catch {
          // fall through to API fetch
        }
      }

      // Direct entry / refresh fallback: fetch from NCBI
      const fetched = await fetchGeneMetadata(geneId);
      if (cancelled) return;

      if (fetched) {
        setGene(fetched);
        if (storedGenomeId) setGenomeId(storedGenomeId);
      } else {
        setError(`Could not load gene information for ID ${geneId}`);
      }
      setIsLoading(false);
    };

    loadGene();
    return () => { cancelled = true; };
  }, [geneId]);

  const handleClose = () => {
    sessionStorage.removeItem("selectedGene");
    sessionStorage.removeItem("selectedGenomeId");
    router.push("/analyze");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !gene) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error ?? "Gene not found"}</p>
        <Button variant="outline" onClick={() => router.push("/analyze")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GeneViewer gene={gene} genomeId={genomeId} onClose={handleClose} />
      </div>
    </div>
  );
}
