"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import {
  Dna,
  Github,
  Search,
  Layers,
  ArrowRight,
  Cpu,
  Activity,
  Database,
} from "lucide-react";
import Link from "next/link";

import {
  type SingleGenomeInfo,
  getAvailableGenomeAssemblies,
} from "~/utils/genome-api";
import {
  type SingleChromosomeInfo,
  getGenomeChromosomes,
} from "~/utils/chromosomes-api";
import type { SingleGeneInfo } from "~/utils/genes-api";
import { getGenes } from "~/utils/genes-api";
import { GeneSearchTab } from "~/components/gene-search-tab";
import { ChromosomeBrowserTab } from "~/components/chromosome-browser-tab";
import { GeneDetailDialog } from "~/components/gene-detail-dialog";

type Mode = "browse" | "search";

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [organism, setOrganism] = useState<string>("Human");
  const [genomes, setGenomes] = useState<SingleGenomeInfo[]>([]);
  const [chromosomes, setChromosomes] = useState<SingleChromosomeInfo[]>([]);
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");
  const [selectedChromosomes, setselectedChromosomes] = useState<string>("");
  const [selectedGene, setSelectedGene] = useState<SingleGeneInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [geneSearchResults, setGeneSearchResults] = useState<SingleGeneInfo[]>(
    [],
  );
  const [genomesByOrganism, setGenomesByOrganism] = useState<
    Record<string, SingleGenomeInfo[]>
  >({});
  const [mode, setMode] = useState<Mode>("browse");

  // Fetch genomes
  useEffect(() => {
    const fetchGenomeAssemblies = async () => {
      try {
        setIsLoading(true);
        const genomesData = await getAvailableGenomeAssemblies();
        setGenomesByOrganism(genomesData.genomes);
        if (genomesData.genomes?.Human) setGenomes(genomesData.genomes.Human);
      } catch {
        setError("Failed to fetch genomes");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomeAssemblies();
  }, []);

  // Fetch chromosomes when genome changes
  useEffect(() => {
    if (!selectedGenome) return;

    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const chromosomeData = await getGenomeChromosomes(selectedGenome);
        setChromosomes(chromosomeData.chromosomes);
        if (chromosomeData.chromosomes.length > 0) {
          setselectedChromosomes(chromosomeData.chromosomes[0]!.name);
        }
      } catch (err) {
        setError(`Failed to fetch Chromosomes ${String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChromosomes();
  }, [selectedGenome]);

  const performGeneSearch = useCallback(
    async (
      query: string,
      genome: string,
      filterFn?: (gene: SingleGeneInfo) => boolean,
    ) => {
      try {
        setIsLoading(true);
        const geneData = await getGenes(query, genome);
        const geneResults = filterFn
          ? geneData.genesResult.filter(filterFn)
          : geneData.genesResult;
        setGeneSearchResults(geneResults);
      } catch {
        setError("Failed to search genes");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Auto browse when chromosome changes (browse mode)
  useEffect(() => {
    if (!selectedChromosomes || mode !== "browse" || !selectedGenome) return;

    performGeneSearch(
      selectedChromosomes,
      selectedGenome,
      (gene: SingleGeneInfo) => gene.chromosome === selectedChromosomes,
    );
  }, [selectedChromosomes, selectedGenome, mode, performGeneSearch]);

  const handleOrganismChange = (value: string) => {
    setOrganism(value);

    const orgGenomes = genomesByOrganism[value] ?? [];
    setGenomes(orgGenomes);

    setGeneSearchResults([]);
    setSelectedGene(null);
    setChromosomes([]);
    setselectedChromosomes("");
    setError(null);

    if (orgGenomes.length > 0) setSelectedGenome(orgGenomes[0]!.id);
    else setSelectedGenome("");
  };

  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
    setGeneSearchResults([]);
    setSelectedGene(null);
    setChromosomes([]);
    setselectedChromosomes("");
    setError(null);
  };

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;

    setGeneSearchResults([]);
    setSelectedGene(null);
    setError(null);

    if (newMode === "browse" && selectedChromosomes) {
      performGeneSearch(
        selectedChromosomes,
        selectedGenome,
        (gene: SingleGeneInfo) => gene.chromosome === selectedChromosomes,
      );
    }

    setMode(newMode);
  };

  const handleGeneClick = (gene: SingleGeneInfo) => {
    setSelectedGene(gene);
    setDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 to-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#3c4f3d] text-white shadow-sm ring-1 ring-[#3c4f3d]/15">
                <Dna className="h-5 w-5" />
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                GeneLM
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-[#3c4f3d] text-white shadow-sm transition-colors hover:bg-[#2d3f2e]"
            >
              <a
                href="https://github.com/JarvisZhang24/GeneLM-Evo2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-1.5 h-4 w-4" />
                View Source
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Workspace Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                <Activity className="h-3.5 w-3.5" />
                Analysis Workspace
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Gene Analysis Console
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Select a gene and open its analysis page to run Evo2-powered
                variant predictions against ClinVar evidence.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200/70 bg-white px-4 py-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                  Workspace
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {organism} &middot; {selectedGenome || "No Assembly"}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {isLoading ? "Syncing" : error ? "Needs Attention" : "Ready"}
              </span>
            </div>
          </div>

          {/* Main Grid: Sidebar + Browser */}
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Sidebar - Genome Configuration */}
            <aside className="lg:col-span-3">
              <Card className="sticky top-24 overflow-hidden border-emerald-200/70 bg-white shadow-lg ring-1 ring-emerald-100/60">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-lime-400 to-amber-400" />
                <div className="border-b border-emerald-200/60 bg-linear-to-b from-white via-emerald-50/40 to-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                        Genome Configuration
                      </p>
                      <CardTitle className="mt-1 text-base font-bold text-slate-900">
                        Analysis Inputs
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs text-slate-600">
                        Define organism context and reference assembly.
                      </CardDescription>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#203123] text-white">
                      <Cpu className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-5 p-4">
                  {/* Organism Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                      Organism
                    </label>
                    <Select
                      value={organism}
                      onValueChange={handleOrganismChange}
                      disabled={
                        isLoading ||
                        Object.keys(genomesByOrganism).length === 0
                      }
                    >
                      <SelectTrigger className="h-9 w-full bg-white text-sm focus:ring-[#3c4f3d]">
                        <SelectValue placeholder="Select organism" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(genomesByOrganism).map((org) => (
                          <SelectItem key={org} value={org}>
                            {org}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reference Genome */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                      Reference Genome
                    </label>
                    <Select
                      value={selectedGenome}
                      onValueChange={handleGenomeChange}
                      disabled={isLoading || genomes.length === 0}
                    >
                      <SelectTrigger className="h-9 w-full bg-white text-sm focus:ring-[#3c4f3d]">
                        <SelectValue placeholder="Select assembly" />
                      </SelectTrigger>
                      <SelectContent>
                        {genomes.map((genome) => (
                          <SelectItem key={genome.id} value={genome.id}>
                            <span className="font-medium text-slate-900">
                              {genome.id}
                            </span>
                            <span className="ml-2 text-slate-500">
                              {genome.description}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assembly Info */}
                  {selectedGenome && (
                    <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Database className="h-4 w-4" />
                        Current Assembly
                      </div>
                      <div className="mt-1 font-mono text-base font-semibold text-slate-900">
                        {selectedGenome}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Source:{" "}
                        {
                          genomes.find((g) => g.id === selectedGenome)
                            ?.sourceName
                        }
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>

            {/* Main Panel - Browser */}
            <div className="lg:col-span-9">
              <Card className="overflow-hidden border-emerald-200/70 bg-white shadow-lg ring-1 ring-emerald-100/60">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-lime-400 to-amber-400" />
                <div className="border-b border-emerald-200/60 bg-linear-to-b from-white via-emerald-50/30 to-white px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                        <Layers className="h-3.5 w-3.5" />
                        Evo2-enabled Browser
                      </div>
                      <CardTitle className="mt-2 text-lg font-black text-slate-900">
                        Gene Browser
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-slate-600">
                        Exploring {chromosomes.length} chromosomes on{" "}
                        {selectedGenome || "\u2014"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                        {geneSearchResults.length > 0
                          ? `${geneSearchResults.length} Genes Found`
                          : isLoading
                            ? "Loading\u2026"
                            : error
                              ? "Error"
                              : "Ready"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        <Activity className="h-3.5 w-3.5" />
                        Live
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  <Tabs
                    value={mode}
                    onValueChange={(value) => switchMode(value as Mode)}
                    className="w-full"
                  >
                    <div className="border-b border-slate-100 px-5 pt-4">
                      <TabsList className="h-11 w-full justify-start rounded-xl border border-slate-200/70 bg-white/90 p-1 shadow-sm sm:w-auto">
                        <TabsTrigger
                          value="browse"
                          className="flex-1 gap-2 px-5 text-sm font-semibold data-[state=active]:bg-[#203123] data-[state=active]:text-white data-[state=active]:shadow-sm sm:flex-none"
                        >
                          <Layers className="h-4 w-4" />
                          Chromosomes
                        </TabsTrigger>
                        <TabsTrigger
                          value="search"
                          className="flex-1 gap-2 px-5 text-sm font-semibold data-[state=active]:bg-[#203123] data-[state=active]:text-white data-[state=active]:shadow-sm sm:flex-none"
                        >
                          <Search className="h-4 w-4" />
                          Gene Search
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-5">
                      <TabsContent
                        value="browse"
                        className="mt-0 focus-visible:outline-none"
                      >
                        <ChromosomeBrowserTab
                          chromosomes={chromosomes}
                          selectedChromosome={selectedChromosomes}
                          onSelectChromosome={setselectedChromosomes}
                          geneResults={geneSearchResults}
                          isLoading={isLoading}
                          onGeneClick={handleGeneClick}
                        />
                      </TabsContent>

                      <TabsContent
                        value="search"
                        className="mt-0 focus-visible:outline-none"
                      >
                        <GeneSearchTab
                          isLoading={isLoading}
                          searchResults={geneSearchResults}
                          onSearch={(query) =>
                            performGeneSearch(query, selectedGenome)
                          }
                          onGeneClick={handleGeneClick}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>

                  {error && (
                    <div className="m-5 rounded-xl border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {error}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Gene Detail Dialog */}
      <GeneDetailDialog
        gene={selectedGene}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        genomeId={selectedGenome}
      />
    </div>
  );
}
