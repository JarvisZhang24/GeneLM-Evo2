"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Search,
  Dna,
  Activity,
  ArrowRight,
  Github,
  BookOpen,
  Menu,
  Cpu,
} from "lucide-react";

import {
  type SingleGenomeInfo,
  getAvailableGenomeAssemblies,
} from "~/utils/genome-api";
import {
  type SingleChromosomeInfo,
  getGenomeChromosomes,
} from "~/utils/chromosomes-api";

type Mode = "browse" | "search";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [organism, setOrganism] = useState<string>("Human");
  const [genomes, setGenomes] = useState<SingleGenomeInfo[]>([]);
  const [chromosomes, setChromosomes] = useState<SingleChromosomeInfo[]>([]);
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");
  const [selectedChromosomes, setselectedChromosomes] = useState<string>("");
  const [genomesByOrganism, setGenomesByOrganism] = useState<
    Record<string, SingleGenomeInfo[]>
  >({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mode, setMode] = useState<Mode>("browse");

  // select genome
  useEffect(() => {
    const fetchGenomeAssemblies = async () => {
      try {
        setIsLoading(true);
        const genomesData = await getAvailableGenomeAssemblies();
        setGenomesByOrganism(genomesData.genomes);

        //Set default genomes
        if (genomesData.genomes && genomesData.genomes["Human"]) {
          setGenomes(genomesData.genomes["Human"]);
        }
        console.log("Available Genome Assemblies:", genomesData);
      } catch (error) {
        setError("Failed to fetch genomes");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomeAssemblies();
  }, []);

  // select chromosomes
  useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const chromosomeData = await getGenomeChromosomes(selectedGenome);
        setChromosomes(chromosomeData.chromosomes);

        console.log(chromosomeData.chromosomes);

        if (chromosomeData.chromosomes.length > 0) {
          setselectedChromosomes(chromosomeData.chromosomes[0]!.name);
        }
      } catch (error) {
        setError(`Failed to fetch Chromosomes ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChromosomes();
  }, [selectedGenome]);

  const handleOrganismChange = (value: string) => {
    setOrganism(value);
    const orgGenomes = genomesByOrganism[value] ?? [];
    setGenomes(orgGenomes);

    // ✨ 改进：自动选中第一个，而不是置空
    if (orgGenomes.length > 0) {
      setSelectedGenome(orgGenomes[0]!.id);
    } else {
      setSelectedGenome("");
    }
  };

  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
  };

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
  };

  const loadBRCA1Example = () => {
    setMode("search");
    setSearchQuery("BRCA1");
  };

  const handleSearchQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    // perform gene search
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Dna className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              GeneLM
            </span>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <a href="#" className="text-slate-600">
                About Me
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#" className="text-slate-600">
                My Projects
              </a>
            </Button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <a
                href="#"
                className="text-slate-500 transition-colors hover:text-slate-900"
              >
                <Github className="h-5 w-5" />
              </a>
              <Button
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                View Source
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-20 pb-16 lg:pt-32 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 shadow-sm transition-colors hover:bg-slate-100">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-slate-600">
                Personal Research Project
              </span>
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Genomic Intelligence <br className="hidden sm:block" />
              <span className="text-slate-500">Powered by Stanford Ev2</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A demonstration of using state-of-the-art language models for
              understanding genetic variants and evolutionary constraints. Built
              by Jarvis Zhang.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                className="gap-2 bg-slate-900 px-8 text-white hover:bg-slate-800"
              >
                Explore Demo <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2 px-8">
                <Github className="h-4 w-4" /> View Code
              </Button>
            </div>
          </div>

          {/* Decorative gradient background */}
          <div className="absolute top-0 -z-10 h-full w-full bg-white">
            <div className="absolute top-0 right-0 bottom-auto left-auto h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.05)] blur-[80px]" />
            <div className="absolute top-auto right-auto bottom-0 left-0 h-[500px] w-[500px] translate-x-[10%] -translate-y-[30%] rounded-full bg-[rgba(108,207,250,0.05)] blur-[80px]" />
          </div>
        </section>

        {/* Dashboard / Tools Section */}
        <section className="bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12">
              {/* Left Panel: Configuration */}
              <div className="space-y-6 lg:col-span-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-6 w-1 rounded-full bg-slate-900" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Configuration
                  </h2>
                </div>

                <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Cpu className="h-4 w-4 text-slate-500" />
                      Genome Assembly
                    </CardTitle>
                    <CardDescription>
                      Select organism and reference genome.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700">
                        Organism
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Human", "Gorilla", "Horse", "Dog", "Cat"].map(
                          (species) => (
                            <Button
                              key={species}
                              variant={
                                organism === species ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handleOrganismChange(species)}
                              disabled={
                                !Object.keys(genomesByOrganism).includes(
                                  species,
                                )
                              }
                              className={
                                organism === species
                                  ? "bg-slate-900 hover:bg-slate-800"
                                  : ""
                              }
                            >
                              {species}
                            </Button>
                          ),
                        )}
                      </div>
                      <Select
                        value={organism}
                        onValueChange={handleOrganismChange}
                        disabled={
                          isLoading ||
                          Object.keys(genomesByOrganism).length === 0
                        }
                      >
                        <SelectTrigger>
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

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700">
                        Reference Genome
                      </label>
                      <Select
                        value={selectedGenome}
                        onValueChange={handleGenomeChange}
                        disabled={isLoading || genomes.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select genome assembly" />
                        </SelectTrigger>

                        <SelectContent>
                          {genomes.map((genome) => (
                            <SelectItem key={genome.id} value={genome.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{genome.id}</span>
                                <span className="text-muted-foreground text-xs">
                                  {genome.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedGenome && (
                        <div className="rounded-md bg-slate-100 p-3 text-xs text-slate-600">
                          Source:{" "}
                          {
                            genomes.find((g) => g.id === selectedGenome)
                              ?.sourceName
                          }
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel: Interactive Area */}
              <div className="space-y-6 lg:col-span-8">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-6 w-1 rounded-full bg-emerald-500" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Exploration
                  </h2>
                </div>

                <Card className="min-h-[400px] border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4 text-slate-500" />
                        Browser Interface
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <Tabs
                      value={mode}
                      onValueChange={(value) => switchMode(value as Mode)}
                      className="w-full"
                    >
                      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                          value="browse"
                          className="relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
                        >
                          Chromosomes
                        </TabsTrigger>
                        <TabsTrigger
                          value="search"
                          className="relative rounded-none border-b-2 border-transparent px-4 pt-2 pb-3 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
                        >
                          Gene Search
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6">
                        <TabsContent
                          value="search"
                          className="animate-in fade-in-50 m-0 duration-300"
                        >
                          <form
                            onSubmit={handleSearchQuery}
                            className="space-y-4"
                          >
                            <div className="flex gap-3">
                              <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                  type="text"
                                  placeholder="Enter gene symbol (e.g. BRCA1)"
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="pl-10"
                                />
                              </div>
                              <Button
                                type="submit"
                                className="bg-slate-900 text-white hover:bg-slate-800"
                                disabled={isLoading || !searchQuery.trim()}
                              >
                                Search
                              </Button>
                            </div>
                          </form>

                          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                              <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                              No search active
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                              Search for a gene to view detailed variant
                              analysis or
                            </p>
                            <Button
                              variant="link"
                              className="mt-2 h-auto p-0 text-emerald-600 hover:text-emerald-700"
                              onClick={loadBRCA1Example}
                            >
                              load BRCA1 example
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="browse"
                          className="animate-in fade-in-50 m-0 duration-300"
                        >
                          <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                              {chromosomes
                                .filter((chrom) => chrom.name.startsWith("chr"))
                                .map((chrom) => (
                                  <Button
                                    key={chrom.name}
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setselectedChromosomes(chrom.name)
                                    }
                                    className={`transition-all ${
                                      selectedChromosomes === chrom.name
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                        : "hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                  >
                                    {chrom.name.replace("chr", "")}
                                  </Button>
                                ))}
                            </div>

                            {selectedChromosomes && (
                              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-slate-900">
                                      Chromosome View:{" "}
                                      <span className="text-emerald-600">
                                        {selectedChromosomes}
                                      </span>
                                    </h3>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                      Visualizer Ready
                                    </span>
                                  </div>
                                </div>
                                <div className="flex h-64 items-center justify-center p-6 text-sm text-slate-500">
                                  Chromosome visualization component would
                                  render here
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </div>

                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                        </div>
                      )}

                      {error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {error}
                        </div>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-xs text-white">
                GL
              </div>
              <p className="text-sm text-slate-500">
                Built with ❤️ by Jarvis Zhang. © 2025.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="link"
                asChild
                className="h-auto px-0 text-slate-500 hover:text-slate-900"
              >
                <a href="#">GitHub</a>
              </Button>
              <Button
                variant="link"
                asChild
                className="h-auto px-0 text-slate-500 hover:text-slate-900"
              >
                <a href="#">LinkedIn</a>
              </Button>
              <Button
                variant="link"
                asChild
                className="h-auto px-0 text-slate-500 hover:text-slate-900"
              >
                <a href="#">Twitter</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
