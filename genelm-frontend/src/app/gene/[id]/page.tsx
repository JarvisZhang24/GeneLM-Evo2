"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import GeneViewer from "~/components/gene-viewer";
import type { SingleGeneInfo } from "~/utils/genes-api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function GeneAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const geneId = params.id as string;

  const [gene, setGene] = useState<SingleGeneInfo | null>(null);
  const [genomeId, setGenomeId] = useState<string>("hg38");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 尝试从 sessionStorage 获取 gene 信息（从首页传递过来）
    const storedGene = sessionStorage.getItem("selectedGene");
    const storedGenomeId = sessionStorage.getItem("selectedGenomeId");

    if (storedGene) {
      try {
        const parsedGene = JSON.parse(storedGene) as SingleGeneInfo;
        // 验证 gene_id 匹配
        if (parsedGene.gene_id === geneId) {
          setGene(parsedGene);
          if (storedGenomeId) {
            setGenomeId(storedGenomeId);
          }
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse stored gene:", e);
      }
    }

    // 如果没有存储的数据，构造一个基本的 gene 对象
    // 实际项目中可能需要从 API 获取完整信息
    setGene({
      gene_id: geneId,
      symbol: "",
      chromsome: "",
      description: "",
      type_of_gene: "",
    });
    setIsLoading(false);
  }, [geneId]);

  const handleClose = () => {
    // 清除存储的数据
    sessionStorage.removeItem("selectedGene");
    sessionStorage.removeItem("selectedGenomeId");
    router.push("/");
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
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
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