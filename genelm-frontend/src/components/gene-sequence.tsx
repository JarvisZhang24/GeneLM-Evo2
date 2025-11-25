import type {
  GeneBounds,
  GeneDetailsFromSearch,
} from "~/utils/gene-details-api";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Dna, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export function GeneSequence({
  geneBounds,
  geneDetail,
  startPosition,
  endPosition,
  onStartPositionChange,
  onEndPositionChange,
  sequenceData,
  sequenceRange,
  isLoading,
  error,
  onSequenceLoadRequest,
  onSequenceClick,
  maxViewRange,
}: {
  geneBounds: GeneBounds | null;
  geneDetail: GeneDetailsFromSearch | null;
  startPosition: string;
  endPosition: string;
  onStartPositionChange: (value: string) => void;
  onEndPositionChange: (value: string) => void;
  sequenceData: string;
  sequenceRange: { startpos: number; endpos: number } | null;
  isLoading: boolean;
  error: string | null;
  onSequenceLoadRequest: () => void;
  onSequenceClick: (position: number, nucleotide: string) => void;
  maxViewRange: number;
}) {
  const handleRefreshSequence = () => {
    onSequenceLoadRequest();
  };

  // 碱基颜色映射
  const getNucleotideColor = (nuc: string) => {
    switch (nuc.toUpperCase()) {
      case "A":
        return "text-red-600";
      case "T":
        return "text-blue-600";
      case "G":
        return "text-green-600";
      case "C":
        return "text-amber-600";
      default:
        return "text-slate-400";
    }
  };

  // 把序列按行分组（每行 60 个碱基，每 10 个一组用空格分隔）
  const BASES_PER_LINE = 60;
  const GROUP_SIZE = 10;

  const formatSequenceLines = () => {
    if (!sequenceData) return [];

    const lines: { lineStart: number; groups: string[] }[] = [];
    const baseStart = sequenceRange?.startpos ?? 1;

    for (let i = 0; i < sequenceData.length; i += BASES_PER_LINE) {
      const lineSeq = sequenceData.slice(i, i + BASES_PER_LINE);
      const groups: string[] = [];

      for (let j = 0; j < lineSeq.length; j += GROUP_SIZE) {
        groups.push(lineSeq.slice(j, j + GROUP_SIZE));
      }

      lines.push({
        lineStart: baseStart + i,
        groups,
      });
    }

    return lines;
  };

  const sequenceLines = formatSequenceLines();

  return (
    <div className="mt-4">
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Dna className="h-4 w-4 text-emerald-600" />
                DNA Sequence
              </CardTitle>
              <CardDescription className="mt-1">
                {sequenceRange
                  ? `Showing ${sequenceRange.startpos.toLocaleString()} – ${sequenceRange.endpos.toLocaleString()} (${sequenceData.length.toLocaleString()} bp)`
                  : "Fetch and view the nucleotide sequence"}
              </CardDescription>
            </div>

            {/* 图例 */}
            <div className="hidden items-center gap-3 text-xs sm:flex">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-red-100" />
                <span className="font-mono text-red-600">A</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-blue-100" />
                <span className="font-mono text-blue-600">T</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-green-100" />
                <span className="font-mono text-green-600">G</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-amber-100" />
                <span className="font-mono text-amber-600">C</span>
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Loading / Error 状态 */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading sequence...
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 序列展示区域 */}
          {!isLoading && sequenceData && (
            <div className="max-h-80 overflow-auto rounded-lg border border-slate-200 bg-slate-50">
              <div className="p-3">
                {sequenceLines.map((line, lineIdx) => (
                  <div key={lineIdx} className="flex hover:bg-slate-100/50">
                    {/* 位置标尺 */}
                    <span className="mr-4 w-20 shrink-0 text-right font-mono text-xs text-slate-400 select-none">
                      {line.lineStart.toLocaleString()}
                    </span>

                    {/* 碱基序列 */}
                    <div className="flex flex-wrap gap-x-2 font-mono text-sm tracking-wide">
                      {line.groups.map((group, groupIdx) => (
                        <span key={groupIdx} className="inline-block">
                          {group.split("").map((nuc, nucIdx) => {
                            const globalIdx =
                              lineIdx * BASES_PER_LINE +
                              groupIdx * GROUP_SIZE +
                              nucIdx;
                            const pos =
                              (sequenceRange?.startpos ?? 1) + globalIdx;

                            return (
                              <span
                                key={nucIdx}
                                className={`cursor-pointer rounded-sm px-px transition-colors hover:bg-emerald-200 ${getNucleotideColor(nuc)}`}
                                onClick={() => onSequenceClick(pos, nuc)}
                                title={`Position: ${pos.toLocaleString()}`}
                              >
                                {nuc}
                              </span>
                            );
                          })}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!isLoading && !sequenceData && !error && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Dna className="mb-2 h-8 w-8" />
              <p className="text-sm">No sequence loaded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
