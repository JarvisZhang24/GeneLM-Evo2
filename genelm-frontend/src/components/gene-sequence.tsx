"use client";

import type {
  GeneBounds,
  GeneDetailsFromSearch,
} from "~/utils/gene-details-api";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dna, Loader2, MapPin, Hash, ChevronRight, Info } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type JSX,
} from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
  sequenceRange: { start: number; end: number } | null;
  isLoading: boolean;
  error: string | null;
  onSequenceLoadRequest: () => void;
  onSequenceClick: (position: number, nucleotide: string) => void;
  maxViewRange: number;
}) {
  const [sliderValues, setSliderValues] = useState({ start: 50, end: 60 });
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingRange, setIsDraggingRange] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverNucleotide, setHoverNucleotide] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<{
    x: number;
    startPos: number;
    endPos: number;
  } | null>(null);

  const currentRangeSize = useMemo(() => {
    const start = parseInt(startPosition);
    const end = parseInt(endPosition);
    return isNaN(start) || isNaN(end) || end < start ? 0 : end - start + 1;
  }, [startPosition, endPosition]);

  // Nucleotide color helper
  const getNucleotideColorClass = useCallback((nucleotide: string) => {
    switch (nucleotide.toUpperCase()) {
      case "A":
        return "text-red-600";
      case "T":
        return "text-blue-600";
      case "G":
        return "text-emerald-600";
      case "C":
        return "text-amber-600";
      default:
        return "text-slate-400";
    }
  }, []);

  useEffect(() => {
    if (!geneBounds) return;
    const minBound = Math.min(geneBounds.min, geneBounds.max);
    const maxBound = Math.max(geneBounds.min, geneBounds.max);
    const totalSize = maxBound - minBound;

    const startNum = parseInt(startPosition);
    const endNum = parseInt(endPosition);

    if (isNaN(startNum) || isNaN(endNum) || totalSize <= 0) {
      setSliderValues({ start: 0, end: 100 });
      return;
    }

    const startPercent = ((startNum - minBound) / totalSize) * 100;
    const endPercent = ((endNum - minBound) / totalSize) * 100;

    setSliderValues({
      start: Math.max(0, Math.min(startPercent, 100)),
      end: Math.max(0, Math.min(endPercent, 100)),
    });
  }, [startPosition, endPosition, geneBounds]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingStart && !isDraggingEnd && !isDraggingRange) return;
      if (!sliderRef.current || !geneBounds) return;

      const sliderRect = sliderRef.current.getBoundingClientRect();
      const relativeX = e.clientX - sliderRect.left;
      const sliderWidth = sliderRect.width;
      let newPercent = (relativeX / sliderWidth) * 100;
      newPercent = Math.max(0, Math.min(newPercent, 100));

      const minBound = Math.min(geneBounds.min, geneBounds.max);
      const maxBound = Math.max(geneBounds.min, geneBounds.max);
      const geneSize = maxBound - minBound;

      if (geneSize <= 0) return;
      const newPosition = Math.round(minBound + (geneSize * newPercent) / 100);

      const currentStartNum = parseInt(startPosition);
      const currentEndNum = parseInt(endPosition);

      if (isDraggingStart) {
        if (!isNaN(currentEndNum)) {
          if (currentEndNum - newPosition + 1 > maxViewRange) {
            onStartPositionChange(String(currentEndNum - maxViewRange + 1));
          } else if (newPosition < currentEndNum) {
            onStartPositionChange(String(newPosition));
          }
        }
      } else if (isDraggingEnd) {
        if (!isNaN(currentStartNum)) {
          if (newPosition - currentStartNum + 1 > maxViewRange) {
            onEndPositionChange(String(currentStartNum + maxViewRange - 1));
          } else if (newPosition > currentStartNum) {
            onEndPositionChange(String(newPosition));
          }
        }
      } else if (isDraggingRange) {
        if (!dragStartX.current) return;
        const pixelsPerBase = sliderWidth / geneSize;
        const dragDeltaPixels = relativeX - dragStartX.current.x;
        const dragDeltaBases = Math.round(dragDeltaPixels / pixelsPerBase);

        let newStart = dragStartX.current.startPos + dragDeltaBases;
        let newEnd = dragStartX.current.endPos + dragDeltaBases;
        const rangeSize =
          dragStartX.current.endPos - dragStartX.current.startPos;

        if (newStart < minBound) {
          newStart = minBound;
          newEnd = minBound + rangeSize;
        }
        if (newEnd > maxBound) {
          newEnd = maxBound;
          newStart = maxBound - rangeSize;
        }

        onStartPositionChange(String(newStart));
        onEndPositionChange(String(newEnd));
      }
    };

    const handleMouseUp = () => {
      if (
        (isDraggingStart || isDraggingEnd || isDraggingRange) &&
        startPosition &&
        endPosition
      ) {
        onSequenceLoadRequest();
      }
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
      setIsDraggingRange(false);
      dragStartX.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDraggingStart,
    isDraggingEnd,
    isDraggingRange,
    geneBounds,
    startPosition,
    endPosition,
    onStartPositionChange,
    onEndPositionChange,
    maxViewRange,
    onSequenceLoadRequest,
  ]);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent, handle: "start" | "end") => {
      e.preventDefault();
      if (handle === "start") {
        setIsDraggingStart(true);
      } else {
        setIsDraggingEnd(true);
      }
    },
    [],
  );

  const handleRangeMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();

      if (!sliderRef.current) return;

      const startNum = parseInt(startPosition);
      const endNum = parseInt(endPosition);

      if (isNaN(startNum) || isNaN(endNum)) return;

      setIsDraggingRange(true);
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const relativeX = e.clientX - sliderRect.left;
      dragStartX.current = { x: relativeX, startPos: startNum, endPos: endNum };
    },
    [startPosition, endPosition],
  );

  const formattedSequence = useMemo(() => {
    if (!sequenceData || !sequenceRange) return null;

    const start = sequenceRange.start;
    const BASES_PER_LINE = 100;
    const GROUP_SIZE = 10;
    const lines: JSX.Element[] = [];

    for (let i = 0; i < sequenceData.length; i += BASES_PER_LINE) {
      const lineStartPos = start + i;
      const chunk = sequenceData.substring(i, i + BASES_PER_LINE);
      const colorizedChars: JSX.Element[] = [];

      for (let j = 0; j < chunk.length; j++) {
        const nucleotide = chunk[j] || "";
        const nucleotidePosition = lineStartPos + j;
        const color = getNucleotideColorClass(nucleotide);
        colorizedChars.push(
          <span
            key={`b-${i}-${j}`}
            onClick={() => onSequenceClick(nucleotidePosition, nucleotide)}
            onMouseEnter={(e) => {
              setHoverPosition(nucleotidePosition);
              setHoverNucleotide(nucleotide);
              setMousePosition({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => {
              setHoverPosition(null);
              setHoverNucleotide(null);
              setMousePosition(null);
            }}
            className={`${color} cursor-pointer rounded px-0.5 font-semibold transition-colors hover:bg-slate-100`}
          >
            {nucleotide}
          </span>,
        );

        if ((j + 1) % GROUP_SIZE === 0 && j + 1 < chunk.length) {
          colorizedChars.push(
            <span
              key={`sp-${i}-${j}`}
              className="inline-block w-3 select-none"
            />,
          );
        }
      }

      lines.push(
        <div
          key={i}
          className="grid grid-cols-[120px_1fr] items-start border-b border-slate-100 py-1.5 last:border-0 hover:bg-slate-50/60"
        >
          <div className="pr-4 text-right font-mono text-[11px] font-semibold text-slate-500 select-none">
            {lineStartPos.toLocaleString()}
          </div>
          <div className="flex flex-wrap gap-y-0.5 tracking-[0.14em]">
            {colorizedChars}
          </div>
        </div>,
      );
    }

    return lines;
  }, [sequenceData, sequenceRange, onSequenceClick, getNucleotideColorClass]);

  return (
    <div className="mt-8 space-y-6">
      <Card className="overflow-hidden border-slate-200/70 bg-white shadow-sm">
        {/* Header - Professional with #3c4f3d primary color */}
        <div className="border-b border-slate-200/60 bg-linear-to-b from-white to-slate-50/60 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3c4f3d] text-white shadow-sm ring-1 ring-[#3c4f3d]/10">
                <Dna className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight text-[#3c4f3d]">
                  Genomic Sequence Explorer
                </CardTitle>
                <div className="mt-1 flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="border-emerald-200/60 bg-white px-2 py-0 font-semibold text-emerald-700"
                  >
                    {geneDetail?.genomicinfo?.[0]?.strand === "+"
                      ? "Forward Strand (5' → 3')"
                      : geneDetail?.genomicinfo?.[0]?.strand === "-"
                        ? "Reverse Strand (3' ← 5')"
                        : "Unknown Strand"}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Info className="h-3 w-3" />
                    Interactive sequence viewer
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Max Window Size
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {maxViewRange.toLocaleString()} bp
                </p>
              </div>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="flex flex-col items-center rounded-xl bg-slate-100/70 px-4 py-2">
                <span className="text-[10px] font-bold tracking-widest text-[#3c4f3d]/60 uppercase">
                  Selected
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {currentRangeSize.toLocaleString()} bp
                </span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <Tabs defaultValue="viewer" className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="viewer">Viewer</TabsTrigger>
                <TabsTrigger value="legend">Legend</TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap items-center gap-2">
                {sequenceRange ? (
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white font-mono text-[10px] text-slate-700"
                  >
                    {sequenceRange.start.toLocaleString()}–
                    {sequenceRange.end.toLocaleString()}
                  </Badge>
                ) : null}
                {sequenceData ? (
                  <Badge
                    variant="secondary"
                    className="border-none bg-slate-100 font-mono text-[10px] text-slate-700"
                  >
                    {sequenceData.length.toLocaleString()} bp loaded
                  </Badge>
                ) : null}
              </div>
            </div>

            <TabsContent value="viewer" className="space-y-6">
              {geneBounds && (
                <div className="space-y-4">
                  {/* Range Info Cards */}
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        <MapPin className="h-3.5 w-3.5" />
                        Gene Coordinates
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-mono text-sm font-bold text-slate-900">
                            {Math.min(
                              geneBounds.min,
                              geneBounds.max,
                            ).toLocaleString()}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500">
                            Start
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold text-slate-900">
                            {Math.max(
                              geneBounds.min,
                              geneBounds.max,
                            ).toLocaleString()}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500">
                            End
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                          <Hash className="h-3.5 w-3.5" />
                          Viewing Region
                        </div>
                        <Badge
                          variant="secondary"
                          className="border-none bg-slate-100 px-2 font-mono text-[10px] text-slate-700"
                        >
                          {(
                            (currentRangeSize /
                              Math.max(
                                1,
                                Math.abs(geneBounds.max - geneBounds.min + 1),
                              )) *
                            100
                          ).toFixed(2)}
                          %
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-mono text-sm font-bold text-slate-900">
                            {parseInt(startPosition || "0").toLocaleString()}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500">
                            Start
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold text-slate-900">
                            {parseInt(endPosition || "0").toLocaleString()}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500">
                            End
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500">
                          Window
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-slate-700">
                          {currentRangeSize.toLocaleString()} bp
                        </span>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="rounded-xl border border-slate-200/70 bg-white p-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        <Info className="h-3.5 w-3.5" />
                        Controls
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Input
                          value={startPosition}
                          onChange={(e) =>
                            onStartPositionChange(e.target.value)
                          }
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="h-10 border-slate-200 bg-white font-mono text-sm font-semibold text-slate-900 focus:border-[#3c4f3d] focus:ring-[#3c4f3d]/15"
                        />
                        <Input
                          value={endPosition}
                          onChange={(e) => onEndPositionChange(e.target.value)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="h-10 border-slate-200 bg-white font-mono text-sm font-semibold text-slate-900 focus:border-[#3c4f3d] focus:ring-[#3c4f3d]/15"
                        />
                      </div>
                      <Button
                        disabled={isLoading}
                        onClick={onSequenceLoadRequest}
                        className="mt-3 h-10 w-full bg-[#3c4f3d] font-bold text-white shadow-sm transition-colors hover:bg-[#2d3f2e] disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fetching
                          </>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Dna className="h-4 w-4" />
                            Load sequence
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Slider */}
                  <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-4">
                    <div ref={sliderRef} className="relative h-10 w-full">
                      {/* Track */}
                      <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-slate-100 ring-1 ring-slate-200/60" />
                      {/* Selected Track */}
                      <div
                        className="absolute top-1/2 h-2 -translate-y-1/2 cursor-grab rounded-full bg-[#3c4f3d]/80 active:cursor-grabbing"
                        style={{
                          left: `${sliderValues.start}%`,
                          width: `${Math.max(0, sliderValues.end - sliderValues.start)}%`,
                        }}
                        onMouseDown={handleRangeMouseDown}
                      />
                      {/* Handles */}
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border border-slate-300 bg-white shadow-sm active:cursor-grabbing"
                        style={{ left: `${sliderValues.start}%` }}
                        onMouseDown={(e) => handleMouseDown(e, "start")}
                      />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border border-slate-300 bg-white shadow-sm active:cursor-grabbing"
                        style={{ left: `${sliderValues.end}%` }}
                        onMouseDown={(e) => handleMouseDown(e, "end")}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>Gene start</span>
                      <span>Drag to navigate</span>
                      <span>Gene end</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error View */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-red-200/60 bg-red-50 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 font-bold text-red-600">
                    !
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Validation Error
                    </p>
                    <p className="text-xs font-medium text-red-600/80">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Sequence Viewer Display Area */}
              <div className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center bg-slate-50/50 py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3c4f3d]" />
                    <p className="mt-4 text-xs font-semibold text-slate-600">
                      Fetching nucleotides…
                    </p>
                  </div>
                ) : sequenceData ? (
                  <div className="flex flex-col">
                    {/* Visual Legend Bar */}
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200/60 bg-white/90 px-5 py-3 backdrop-blur">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                          Sequence
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] font-bold text-red-600">
                            A
                          </span>
                          <span className="font-mono text-[11px] font-bold text-blue-600">
                            T
                          </span>
                          <span className="font-mono text-[11px] font-bold text-emerald-600">
                            G
                          </span>
                          <span className="font-mono text-[11px] font-bold text-amber-600">
                            C
                          </span>
                          <span className="hidden text-[10px] font-semibold text-slate-500 sm:inline">
                            10bp groups · 100bp/line
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="border-none bg-slate-100 font-mono text-[10px] text-slate-700"
                      >
                        {sequenceData.length.toLocaleString()} bp
                      </Badge>
                    </div>

                    {/* Main Content with Custom Scrollbar */}
                    <div className="scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent max-h-[520px] overflow-auto bg-slate-50/30 p-5">
                      <div className="font-mono text-[12px] leading-relaxed text-slate-900">
                        {formattedSequence}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-slate-50/30 py-24 text-slate-300">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
                      <Dna className="h-10 w-10 opacity-20" />
                    </div>
                    <p className="text-base font-bold text-slate-400">
                      Sequence not yet initialized
                    </p>
                    <p className="mt-2 max-w-xs text-center text-xs leading-relaxed font-medium text-slate-400">
                      Please define a valid coordinate range above and click the
                      load button to retrieve genomic sequence data.
                    </p>
                  </div>
                )}

                {/* Premium Floating Tooltip */}
                {hoverPosition !== null && mousePosition && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="pointer-events-none fixed z-[100] overflow-hidden rounded-xl bg-[#0f1a10] p-0 shadow-2xl ring-1 ring-white/10"
                    style={{
                      top: mousePosition.y - 65,
                      left: mousePosition.x,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="border-b border-white/10 bg-[#0f1a10] px-4 py-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-black tracking-[0.2em] text-white/50 uppercase">
                            Genomic Position
                          </p>
                          <p className="mt-0.5 font-mono text-sm leading-none font-black text-white">
                            {hoverPosition.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black tracking-[0.2em] text-white/50 uppercase">
                            Base
                          </span>
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 font-mono text-sm font-black text-white">
                            {(hoverNucleotide ?? "").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 bg-black/25 px-4 py-1.5">
                      <span className="text-[10px] font-bold text-emerald-400/80 uppercase">
                        Click to analyze
                      </span>
                      <ChevronRight className="h-3 w-3 text-emerald-400/50" />
                    </div>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="legend" className="space-y-6">
              {/* Detailed Legend Info - Bottom Section */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  {
                    l: "A",
                    c: "bg-red-600",
                    n: "Adenine",
                    d: "Purine base, pairs with T",
                    ring: "ring-red-100",
                  },
                  {
                    l: "T",
                    c: "bg-blue-600",
                    n: "Thymine",
                    d: "Pyrimidine base, pairs with A",
                    ring: "ring-blue-100",
                  },
                  {
                    l: "G",
                    c: "bg-green-600",
                    n: "Guanine",
                    d: "Purine base, pairs with C",
                    ring: "ring-green-100",
                  },
                  {
                    l: "C",
                    c: "bg-amber-600",
                    n: "Cytosine",
                    d: "Pyrimidine base, pairs with G",
                    ring: "ring-amber-100",
                  },
                ].map((item) => (
                  <div
                    key={item.l}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-[#3c4f3d]/10 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.c} text-sm font-black text-white shadow-lg ring-4 ${item.ring}`}
                      >
                        {item.l}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700">
                          {item.n}
                        </p>
                        <p className="text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
                          Nucleotide
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] leading-relaxed font-medium text-slate-500 italic">
                      {item.d}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default GeneSequence;
