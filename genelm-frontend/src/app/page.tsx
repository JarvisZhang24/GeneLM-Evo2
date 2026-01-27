"use client";

import { useEffect, useState, useRef } from "react";
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
  Sparkles,
  Database,
  Cpu,
  Activity,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const MotionDiv = motion.div;

/**
 * ✅ Professional background replacement:
 * - Subtle grid + soft radial gradients
 * - A few blurred "accent" dots (very low contrast)
 * - No particles, no helix, no noisy animation
 */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:28px_28px]" />

      {/* Soft radial wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(60,79,61,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(15,23,42,0.06),transparent_60%)]" />

      {/* Accent blobs */}
      <div className="absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full bg-linear-to-br from-[#3c4f3d]/18 to-emerald-200/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-linear-to-tr from-slate-200/25 to-slate-100/5 blur-3xl" />

      {/* A few subtle dots (static, professional) */}
      <div className="absolute top-[28%] left-[12%] h-2 w-2 rounded-full bg-[#3c4f3d]/18" />
      <div className="absolute top-[34%] left-[18%] h-1.5 w-1.5 rounded-full bg-slate-400/18" />
      <div className="absolute top-[26%] right-[16%] h-2 w-2 rounded-full bg-slate-400/14" />
      <div className="absolute top-[40%] right-[22%] h-1.5 w-1.5 rounded-full bg-[#3c4f3d]/14" />
    </div>
  );
}

// Animated Counter
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Typewriter Effect
function TypewriterText({ texts }: { texts: string[] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex] || "";
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentFullText.length) {
            setDisplayText(currentFullText.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex, texts]);

  return (
    <span className="bg-linear-to-r from-[#3c4f3d] via-emerald-700 to-teal-600 bg-clip-text text-transparent">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="ml-1 inline-block h-[1em] w-[3px] bg-[#3c4f3d] align-middle"
      />
    </span>
  );
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const toolsSectionRef = useRef<HTMLElement>(null);

  // Track scroll for header effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const performGeneSearch = async (
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
  };

  // Auto browse when chromosome changes (browse mode)
  useEffect(() => {
    if (!selectedChromosomes || mode !== "browse" || !selectedGenome) return;

    performGeneSearch(
      selectedChromosomes,
      selectedGenome,
      (gene: SingleGeneInfo) => gene.chromosome === selectedChromosomes,
    );
  }, [selectedChromosomes, selectedGenome, mode]);

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

  const handleStartExploring = () => {
    switchMode("browse");
    toolsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGeneClick = (gene: SingleGeneInfo) => {
    setSelectedGene(gene);
    setDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 to-white">
      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#3c4f3d] text-white shadow-sm ring-1 ring-[#3c4f3d]/15">
              <Dna className="h-5 w-5" />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              GeneLM
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              className="cursor-not-allowed text-slate-400 hover:bg-transparent hover:text-slate-400"
              disabled
            >
              About Me
            </Button>
            <Button
              variant="ghost"
              className="cursor-not-allowed text-slate-400 hover:bg-transparent hover:text-slate-400"
              disabled
            >
              My Projects
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <a href="#tools">Tools</a>
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
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
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  View Source
                </a>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <MotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden"
            >
              <nav className="flex flex-col gap-1 p-4">
                <Button
                  variant="ghost"
                  className="cursor-not-allowed justify-start text-slate-400 hover:bg-transparent hover:text-slate-400"
                  disabled
                >
                  About Me
                </Button>
                <Button
                  variant="ghost"
                  className="cursor-not-allowed justify-start text-slate-400 hover:bg-transparent hover:text-slate-400"
                  disabled
                >
                  My Projects
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <a href="#tools">Tools</a>
                </Button>

                <div className="my-2 h-px bg-slate-200" />

                <Button asChild size="sm" className="bg-[#3c4f3d] text-white">
                  <a
                    href="https://github.com/JarvisZhang24/GeneLM-Evo2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View Source
                  </a>
                </Button>
              </nav>
            </MotionDiv>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* ✅ Hero Section: no helix, no particles, professional backdrop */}
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-linear-to-b from-white via-slate-50/60 to-slate-50 pt-20 pb-16 lg:pt-28 lg:pb-28">
          <HeroBackdrop />

          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            {/* Badge */}
            <MotionDiv
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto mb-6 flex max-w-fit items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/75 px-4 py-2 shadow-sm backdrop-blur"
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-[#3c4f3d]/70" />
              <span className="text-sm font-medium text-slate-700">
                Personal Research Project
              </span>
              <span className="text-sm text-slate-400">·</span>
              <span className="text-sm text-slate-600">Evo2 integrated</span>
            </MotionDiv>

            {/* Title */}
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Genomic Intelligence <br className="hidden sm:block" />
                <TypewriterText
                  texts={[
                    "Powered by Evo2",
                    "Variant Analysis",
                    "Zero-Shot Prediction",
                    "DNA Language Model",
                  ]}
                />
              </h1>
            </MotionDiv>

            {/* Subtitle */}
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                A demonstration of using state-of-the-art language models for
                understanding genetic variants and evolutionary constraints.
              </p>
            </MotionDiv>

            {/* CTA */}
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="group gap-2 bg-[#3c4f3d] px-8 text-white shadow-sm transition-colors hover:bg-[#2d3f2e]"
                onClick={handleStartExploring}
              >
                Explore Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-slate-300 bg-white/70 px-8 hover:bg-white"
                asChild
              >
                <a
                  href="https://github.com/JarvisZhang24/GeneLM-Evo2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" /> View Code
                </a>
              </Button>
            </MotionDiv>

            {/* Stats */}
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8"
            >
              {[
                { value: 7, suffix: "B", label: "Model Parameters" },
                { value: 8192, suffix: "", label: "Context Window" },
                { value: 95, suffix: "%", label: "AUROC on BRCA1" },
                { value: 24, suffix: "+", label: "Genome Assemblies" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur transition-all hover:border-[#3c4f3d]/25 hover:shadow-md sm:p-6"
                  whileHover={{ scale: 1.01, y: -1 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + index * 0.08 }}
                >
                  <div className="absolute inset-0 bg-linear-to-br from-[#3c4f3d]/8 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </MotionDiv>

            {/* Feature Pills */}
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.72 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: Zap, label: "Real-time Analysis" },
                { icon: Database, label: "Multi-genome Support" },
                { icon: Dna, label: "Gene Browser" },
                { icon: Cpu, label: "H100 GPU Powered" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:border-[#3c4f3d]/25 hover:bg-white hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.78 + index * 0.06 }}
                >
                  <feature.icon className="h-4 w-4 text-[#3c4f3d]" />
                  {feature.label}
                </motion.div>
              ))}
            </MotionDiv>
          </div>
        </section>

        {/* Tools Section */}
        <section
          id="tools"
          ref={toolsSectionRef}
          className="relative bg-linear-to-b from-slate-50 via-white to-slate-50 py-16"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-lime-400 to-amber-400" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                  <Activity className="h-3.5 w-3.5" />
                  Analysis Workspace
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  Professional Gene Analysis Console
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Configure genome context, browse loci, and launch Evo2-powered
                  analysis with curated clinical data.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200/70 bg-white px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                    Workspace
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {organism} · {selectedGenome || "No Assembly"}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {isLoading ? "Syncing" : error ? "Needs Attention" : "Ready"}
                </span>
              </div>
            </div>
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
                          {selectedGenome || "—"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                          {geneSearchResults.length > 0
                            ? `${geneSearchResults.length} Genes Found`
                            : isLoading
                              ? "Loading…"
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
        </section>
      </main>

      {/* Gene Detail Dialog */}
      <GeneDetailDialog
        gene={selectedGene}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        genomeId={selectedGenome}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3c4f3d]">
                <Dna className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                GeneLM
              </span>
              <span className="text-sm text-slate-500">
                © 2025 Jarvis Zhang
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-slate-500 transition-colors hover:text-[#3c4f3d]"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 transition-colors hover:text-[#3c4f3d]"
              >
                Terms
              </a>
              <a
                href="https://github.com/JarvisZhang24"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
