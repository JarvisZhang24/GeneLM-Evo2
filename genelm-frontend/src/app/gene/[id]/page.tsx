"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import GeneViewer from "~/components/gene-viewer";
import { Button } from "~/components/ui/button";
import { getGeneById, type SingleGeneInfo } from "~/utils/genes-api";

export default function GeneAnalysisPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const geneId = params.id;
  const [gene, setGene] = useState<SingleGeneInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadGene = async () => {
      try {
        const stored = sessionStorage.getItem("selectedGene");
        if (stored) {
          const parsed = JSON.parse(stored) as SingleGeneInfo;
          if (parsed.gene_id === geneId && parsed.chromosome) {
            if (!cancelled) setGene(parsed);
            return;
          }
        }
        const fetched = await getGeneById(geneId);
        if (!cancelled) setGene(fetched);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Gene not found",
          );
        }
      }
    };
    void loadGene();
    return () => {
      cancelled = true;
    };
  }, [geneId]);

  if (!gene && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3c4f3d]" />
      </div>
    );
  }
  if (error || !gene) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-700">{error ?? "Gene not found"}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back home
        </Button>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GeneViewer gene={gene} onClose={() => router.push("/")} />
      </div>
    </main>
  );
}
