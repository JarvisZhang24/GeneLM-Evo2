'use client'

import type { SingleGeneInfo } from "~/utils/genes-api";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchGeneDetails,
  type GeneBounds,
  type GeneDetailsFromSearch
} from "~/utils/gene-details-api";
import {fetchGeneSequence as apiFetchGeneSequence} from "~/utils/gene-sequence-api";
import { setServers } from "dns";
import { ApiError } from "next/dist/server/api-utils";
import { GeneInformation } from "./gene-information";
import { GeneSequence } from "./gene-sequence";

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
  const [geneBounds, setGeneBounds ] = useState<GeneBounds | null>(null)
  const [startPosition, setStartPosition ] = useState<string>("")
  const [geneSequence , setGeneSequence] = useState<string>("")
  const [isLoadingSequence, setIsLoadingSequence] = useState(false);
  const [actualRange , setActualRange] = useState<{startpos : number, endpos : number} | null >(null)

  const [endPosition, setEndPosition ] = useState<string>("")

  const fetchGeneSequence  = useCallback(
    async (start:number , end : number) => {
      try {
        setIsLoadingSequence(true)
        setError(null)
        const { sequence, actualRange:fetchedRange, error:apiError }= await apiFetchGeneSequence(
          gene.chromsome ,
          start,
          end ,
          genomeId
        )

        setGeneSequence(sequence)

        setActualRange(fetchedRange)

        if(apiError){
          setError(apiError)
        }

        //console.log(sequence)

      } catch (error) {

        setError("failed to load sequence data")
      }finally{
        setIsLoadingSequence(false)
      }
    },
    [gene.chromsome  ,genomeId ]
  )

  useEffect(()=>{

    const geneDetailData = async() =>{
      setIsLoading(true)
      setError(null)

      setGeneDetail(null)

      setStartPosition("")
      setEndPosition("")

      if(!gene.gene_id ){
        setError("Gene ID is missing , can not fetch detail ")
        setIsLoading(false)
        return
      }

      try {

        setIsLoading(false)

        const {
          geneDetails:fetchedGeneDeatils ,
          geneBounds :fetchedGeneBounds,
          initialRange : fetchedGeneRange
        } = await fetchGeneDetails(gene.gene_id)

        setGeneDetail(fetchedGeneDeatils)

        setGeneBounds(fetchedGeneBounds)

        if(fetchedGeneRange){
          setStartPosition(String(fetchedGeneRange.start))
          setEndPosition(String(fetchedGeneRange.end))

          // fetch gene Sequence
          await fetchGeneSequence(fetchedGeneRange.start , fetchedGeneRange.end)
          //console.log(fetchedGeneDeatils)
        }

      } catch (error) {
        setError("faield to load gene information , please try again!")

      }

    }

    geneDetailData()

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

      <GeneInformation gene={gene}  geneDetail={geneDetail} geneBounds={geneBounds}/>

      <GeneSequence 
      geneBounds={geneBounds} 
      geneDetail={geneDetail} 
      startPosition= {startPosition} 
      endPosition={endPosition} 
      onStartPositionChange={setStartPosition} 
      onEndPositionChange={setEndPosition} 
       
      sequenceData={geneSequence} 
      sequenceRange={actualRange} 
      isLoading={isLoadingSequence} 
      error={error} 
      onSequenceLoadRequest={function (): void {
        throw new Error("Function not implemented.");
      } } 
      onSequenceClick={function (position: number, nucleotide: string): void {
        throw new Error("Function not implemented.");
      } } 
      maxViewRange={10000} />

      
    </div>
  );
}












// "use client";

// import type { SingleGeneInfo } from "~/utils/genes-api";
// import { Button } from "~/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "~/components/ui/card";
// import { Input } from "~/components/ui/input";
// import {
//   ArrowLeft,
//   Dna,
//   MapPin,
//   Tag,
//   Loader2,
//   AlertCircle,
//   Copy,
//   Check,
//   RefreshCw,
//   ExternalLink,
//   Hash,
//   Download,
//   BarChart3,
// } from "lucide-react";
// import { useCallback, useEffect, useState, useMemo } from "react";
// import {
//   fetchGeneDetails,
//   type GeneBounds,
//   type GeneDetailsFromSearch,
// } from "~/utils/gene-details-api";
// import { fetchGeneSequence as apiFetchGeneSequence } from "~/utils/gene-sequence-api";

// export default function GeneViewer({
//   gene,
//   genomeId,
//   onClose,
// }: {
//   gene: SingleGeneInfo;
//   genomeId: string;
//   onClose: () => void;
// }) {
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [geneDetail, setGeneDetail] = useState<GeneDetailsFromSearch | null>(
//     null,
//   );
//   const [geneBounds, setGeneBounds] = useState<GeneBounds | null>(null);
//   const [startPosition, setStartPosition] = useState<string>("");
//   const [endPosition, setEndPosition] = useState<string>("");
//   const [geneSequence, setGeneSequence] = useState<string>("");
//   const [isLoadingSequence, setIsLoadingSequence] = useState(false);
//   const [actualRange, setActualRange] = useState<{
//     startpos: number;
//     endpos: number;
//   } | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [showLineNumbers, setShowLineNumbers] = useState(true);

//   // Sequence statistics
//   const sequenceStats = useMemo(() => {
//     if (!geneSequence) return null;
//     const counts = { A: 0, T: 0, C: 0, G: 0, other: 0 };
//     geneSequence
//       .toUpperCase()
//       .split("")
//       .forEach((c) => {
//         if (c in counts) counts[c as keyof typeof counts]++;
//         else counts.other++;
//       });
//     const total = counts.A + counts.T + counts.C + counts.G;
//     const gc =
//       total > 0 ? (((counts.G + counts.C) / total) * 100).toFixed(1) : "0";
//     return { ...counts, gc, total };
//   }, [geneSequence]);

//   // Color mapping for nucleotides
//   const nucleotideColors: Record<string, string> = {
//     A: "text-rose-400",
//     T: "text-sky-400",
//     C: "text-amber-400",
//     G: "text-emerald-400",
//   };

//   // Format sequence with line numbers
//   const formatSequence = (seq: string, lineWidth: number = 60) => {
//     const lines: { num: number; content: string }[] = [];
//     for (let i = 0; i < seq.length; i += lineWidth) {
//       lines.push({
//         num: i + 1,
//         content: seq.slice(i, i + lineWidth),
//       });
//     }
//     return lines;
//   };

//   const fetchGeneSequence = useCallback(
//     async (start: number, end: number) => {
//       try {
//         setIsLoadingSequence(true);
//         setError(null);
//         const {
//           sequence,
//           actualRange: fetchedRange,
//           error: apiError,
//         } = await apiFetchGeneSequence(gene.chromsome, start, end, genomeId);
//         setGeneSequence(sequence || "");
//         setActualRange(fetchedRange);
//         if (apiError) {
//           setError(apiError);
//         }
//       } catch {
//         setError("Failed to load sequence data");
//         setGeneSequence("");
//       } finally {
//         setIsLoadingSequence(false);
//       }
//     },
//     [gene.chromsome, genomeId],
//   );

//   useEffect(() => {
//     const loadGeneData = async () => {
//       setIsLoading(true);
//       setError(null);

//       if (!gene.gene_id) {
//         setError("Gene ID is missing");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const {
//           geneDetails,
//           geneBounds: bounds,
//           initialRange,
//         } = await fetchGeneDetails(gene.gene_id);
//         setGeneDetail(geneDetails);
//         setGeneBounds(bounds);

//         if (initialRange) {
//           setStartPosition(String(initialRange.start));
//           setEndPosition(String(initialRange.end));
//           await fetchGeneSequence(initialRange.start, initialRange.end);
//         }
//       } catch {
//         setError("Failed to load gene information");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadGeneData();
//   }, [gene, genomeId, fetchGeneSequence]);

//   const handleRefreshSequence = () => {
//     const start = parseInt(startPosition);
//     const end = parseInt(endPosition);

//     if (isNaN(start) || isNaN(end) || start >= end) {
//       setError("Invalid range: Start must be less than End");
//       return;
//     }

//     if (geneBounds && (start < geneBounds.min || end > geneBounds.max)) {
//       setError(
//         `Position must be within ${geneBounds.min.toLocaleString()} - ${geneBounds.max.toLocaleString()}`,
//       );
//       return;
//     }

//     setError(null);
//     fetchGeneSequence(start, end);
//   };

//   const copySequence = () => {
//     navigator.clipboard.writeText(geneSequence);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const downloadFasta = () => {
//     const header = `>${gene.symbol || gene.gene_id}|chr${gene.chromsome}:${actualRange?.startpos}-${actualRange?.endpos}`;
//     const formattedSeq =
//       geneSequence.match(/.{1,70}/g)?.join("\n") || geneSequence;
//     const content = `${header}\n${formattedSeq}`;
//     const blob = new Blob([content], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${gene.symbol || gene.gene_id}.fasta`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="relative">
//             <div className="h-16 w-16 rounded-full border-4 border-emerald-100" />
//             <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-emerald-600" />
//           </div>
//           <p className="text-sm text-slate-500">Loading gene information...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Navigation Header */}
//       <div className="flex items-center justify-between border-b border-slate-200 pb-4">
//         <Button
//           variant="ghost"
//           size="sm"
//           className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
//           onClick={onClose}
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to Search
//         </Button>
//         <div className="flex items-center gap-2">
//           <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
//             {genomeId}
//           </span>
//         </div>
//       </div>

//       {/* Gene Header Card */}
//       <Card className="overflow-hidden border-slate-200">
//         <div className="bg-linear-to-r from-emerald-500 to-teal-500 px-6 py-8">
//           <div className="flex items-start gap-4">
//             <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
//               <Dna className="h-7 w-7 text-white" />
//             </div>
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-white">
//                 {gene.symbol || "Unknown Gene"}
//               </h1>
//               <p className="mt-1 text-emerald-100">
//                 {gene.description || "No description available"}
//               </p>
//             </div>
//           </div>
//         </div>
//         <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
//               <Hash className="h-5 w-5 text-emerald-600" />
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Gene ID</p>
//               <p className="font-mono font-semibold text-slate-900">
//                 {gene.gene_id}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
//               <MapPin className="h-5 w-5 text-teal-600" />
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Chromosome</p>
//               <p className="font-semibold text-slate-900">
//                 {gene.chromsome || "N/A"}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
//               <Tag className="h-5 w-5 text-cyan-600" />
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Gene Type</p>
//               <p className="font-semibold text-slate-900">
//                 {gene.type_of_gene || "N/A"}
//               </p>
//             </div>
//           </div>
//           {geneBounds && (
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
//                 <Dna className="h-5 w-5 text-purple-600" />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-500">Length</p>
//                 <p className="font-mono font-semibold text-slate-900">
//                   {(geneBounds.max - geneBounds.min).toLocaleString()} bp
//                 </p>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Error Alert */}
//       {error && (
//         <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
//           <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
//           <p className="text-sm text-red-700">{error}</p>
//         </div>
//       )}

//       {/* Gene Summary */}
//       {geneDetail?.summary && (
//         <Card className="border-slate-200">
//           <CardHeader>
//             <CardTitle className="text-base">Summary</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm leading-relaxed text-slate-600">
//               {geneDetail.summary}
//             </p>
//           </CardContent>
//         </Card>
//       )}

//       {/* Genomic Position */}
//       {geneBounds && (
//         <Card className="border-slate-200">
//           <CardHeader>
//             <CardTitle className="text-base">Genomic Position</CardTitle>
//             <CardDescription>Position on {gene.chromsome}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center gap-4">
//               <div className="flex-1 rounded-lg bg-slate-100 p-4">
//                 <p className="text-xs text-slate-500">Start</p>
//                 <p className="font-mono text-lg font-bold text-slate-900">
//                   {geneBounds.min.toLocaleString()}
//                 </p>
//               </div>
//               <div className="text-slate-300">→</div>
//               <div className="flex-1 rounded-lg bg-slate-100 p-4">
//                 <p className="text-xs text-slate-500">End</p>
//                 <p className="font-mono text-lg font-bold text-slate-900">
//                   {geneBounds.max.toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Sequence Viewer */}
//       <Card className="border-slate-200">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-base">
//             <Dna className="h-4 w-4 text-emerald-600" />
//             DNA Sequence
//           </CardTitle>
//           <CardDescription>
//             Fetch and view the nucleotide sequence
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Range Selector */}
//           <div className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-4">
//             <div className="min-w-[140px] flex-1">
//               <label className="mb-1.5 block text-xs font-medium text-slate-600">
//                 Start Position
//               </label>
//               <Input
//                 type="number"
//                 value={startPosition}
//                 onChange={(e) => setStartPosition(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleRefreshSequence()}
//                 placeholder="e.g. 1000000"
//                 className="font-mono"
//               />
//             </div>
//             <div className="min-w-[140px] flex-1">
//               <label className="mb-1.5 block text-xs font-medium text-slate-600">
//                 End Position
//               </label>
//               <Input
//                 type="number"
//                 value={endPosition}
//                 onChange={(e) => setEndPosition(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleRefreshSequence()}
//                 placeholder="e.g. 1010000"
//                 className="font-mono"
//               />
//             </div>
//             <Button
//               onClick={handleRefreshSequence}
//               disabled={isLoadingSequence}
//               className="min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
//             >
//               {isLoadingSequence ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Fetching...
//                 </>
//               ) : (
//                 <>
//                   <RefreshCw className="mr-2 h-4 w-4" />
//                   Fetch Sequence
//                 </>
//               )}
//             </Button>
//           </div>

//           {/* Sequence Statistics */}
//           {sequenceStats && geneSequence && (
//             <div className="rounded-lg border border-slate-200 bg-white p-4">
//               <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
//                 <BarChart3 className="h-4 w-4" />
//                 Sequence Composition
//               </div>
//               <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
//                 <div className="rounded-lg bg-rose-50 p-3 text-center">
//                   <span className="text-lg font-bold text-rose-500">
//                     {sequenceStats.A.toLocaleString()}
//                   </span>
//                   <p className="text-xs text-rose-600">Adenine (A)</p>
//                 </div>
//                 <div className="rounded-lg bg-sky-50 p-3 text-center">
//                   <span className="text-lg font-bold text-sky-500">
//                     {sequenceStats.T.toLocaleString()}
//                   </span>
//                   <p className="text-xs text-sky-600">Thymine (T)</p>
//                 </div>
//                 <div className="rounded-lg bg-amber-50 p-3 text-center">
//                   <span className="text-lg font-bold text-amber-500">
//                     {sequenceStats.C.toLocaleString()}
//                   </span>
//                   <p className="text-xs text-amber-600">Cytosine (C)</p>
//                 </div>
//                 <div className="rounded-lg bg-emerald-50 p-3 text-center">
//                   <span className="text-lg font-bold text-emerald-500">
//                     {sequenceStats.G.toLocaleString()}
//                   </span>
//                   <p className="text-xs text-emerald-600">Guanine (G)</p>
//                 </div>
//                 <div className="rounded-lg bg-purple-50 p-3 text-center">
//                   <span className="text-lg font-bold text-purple-500">
//                     {sequenceStats.gc}%
//                   </span>
//                   <p className="text-xs text-purple-600">GC Content</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Sequence Display */}
//           {geneSequence && (
//             <div className="space-y-3">
//               <div className="flex flex-wrap items-center justify-between gap-2">
//                 <div className="flex items-center gap-2 text-sm text-slate-500">
//                   {actualRange && (
//                     <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">
//                       {actualRange.startpos.toLocaleString()} -{" "}
//                       {actualRange.endpos.toLocaleString()}
//                     </span>
//                   )}
//                   <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
//                     {geneSequence.length.toLocaleString()} bp
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setShowLineNumbers(!showLineNumbers)}
//                     className={`rounded px-2 py-1 text-xs transition-colors ${
//                       showLineNumbers
//                         ? "bg-slate-200 text-slate-700"
//                         : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//                     }`}
//                   >
//                     Line #
//                   </button>
//                   <Button variant="outline" size="sm" onClick={downloadFasta}>
//                     <Download className="mr-1.5 h-3.5 w-3.5" />
//                     FASTA
//                   </Button>
//                   <Button variant="outline" size="sm" onClick={copySequence}>
//                     {copied ? (
//                       <>
//                         <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
//                         Copied
//                       </>
//                     ) : (
//                       <>
//                         <Copy className="mr-1.5 h-3.5 w-3.5" />
//                         Copy
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>

//               {/* Color Legend */}
//               <div className="flex flex-wrap items-center gap-4 rounded-lg bg-slate-800 px-4 py-2 text-xs">
//                 <span className="text-slate-400">Legend:</span>
//                 <span className="flex items-center gap-1">
//                   <span className="h-3 w-3 rounded bg-rose-400"></span>
//                   <span className="text-rose-400">A</span>
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <span className="h-3 w-3 rounded bg-sky-400"></span>
//                   <span className="text-sky-400">T</span>
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <span className="h-3 w-3 rounded bg-amber-400"></span>
//                   <span className="text-amber-400">C</span>
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <span className="h-3 w-3 rounded bg-emerald-400"></span>
//                   <span className="text-emerald-400">G</span>
//                 </span>
//               </div>

//               <div className="max-h-[400px] overflow-auto rounded-lg bg-slate-900 p-4">
//                 <div className="space-y-1.5 font-mono text-xs leading-relaxed">
//                   {formatSequence(geneSequence).map((line) => (
//                     <div
//                       key={line.num}
//                       className="flex rounded-md bg-slate-900/80 px-3 py-1"
//                     >
//                       {showLineNumbers && (
//                         <span className="mr-4 w-12 shrink-0 text-right text-slate-500 select-none">
//                           {line.num}
//                         </span>
//                       )}
//                       <span className="break-all">
//                         {line.content.split("").map((char, i) => (
//                           <span
//                             key={i}
//                             className={
//                               nucleotideColors[char.toUpperCase()] ||
//                               "text-slate-400"
//                             }
//                           >
//                             {char}
//                           </span>
//                         ))}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {!geneSequence && !isLoadingSequence && (
//             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
//               <Dna className="mb-3 h-10 w-10 text-slate-300" />
//               <p className="text-sm text-slate-500">
//                 Enter a range and click "Fetch Sequence" to view the DNA
//                 sequence
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* External Links */}
//       <Card className="border-slate-200">
//         <CardHeader>
//           <CardTitle className="text-base">External Resources</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-wrap gap-3">
//             {gene.gene_id && (
//               <>
//                 <a
//                   href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
//                 >
//                   <ExternalLink className="h-4 w-4" />
//                   NCBI Gene
//                 </a>

//                 <a
//                   href={`http://mygene.info/v3/gene/${gene.gene_id}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
//                 >
//                   <ExternalLink className="h-4 w-4" />
//                   MyGene.info
//                 </a>
//               </>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
