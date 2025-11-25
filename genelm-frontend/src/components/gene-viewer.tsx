'use client'

import type { SingleGeneInfo } from "~/utils/genes-api";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import type { GeneDetailsFromSearch } from "~/utils/gene-details-api";

export default function GeneViewer({
  gene,
  genomeId,
  onClose,
}: {
  gene: SingleGeneInfo;
  genomeId: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [geneDetail , setGeneDetail ] = useState<GeneDetailsFromSearch | null >(null)




  

  useEffect(()=>{



  }, [gene,genomeId])

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="cursor-pointer text-[#3c4f3d] hover:bg-[#e9eeea]/70"
        onClick={onClose}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to results
      </Button>
    </div>
  );
}
