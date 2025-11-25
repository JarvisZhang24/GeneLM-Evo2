"use client";

import { useEffect, useState, useRef } from "react";
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
import { Button } from "~/components/ui/button";
import {
  Dna,
  Activity,
  ArrowRight,
  Github,
  Menu,
  Cpu,
  Sparkles,
  Zap,
  Database,
  X,
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

// DNA Helix Animation Component
function DNAHelix() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div className="absolute top-0 left-1/4 h-full w-px">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`left-${i}`}
            className="absolute h-3 w-3 rounded-full bg-emerald-500"
            style={{ top: `${i * 5}%` }}
            animate={{
              x: [0, 30, 0, -30, 0],
              scale: [1, 1.2, 1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              delay: i * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="absolute top-0 right-1/4 h-full w-px">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`right-${i}`}
            className="absolute h-3 w-3 rounded-full bg-teal-500"
            style={{ top: `${i * 5}%` }}
            animate={{
              x: [0, -30, 0, 30, 0],
              scale: [1, 1.2, 1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              delay: i * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {/* Connecting lines */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute left-1/4 h-px bg-linear-to-r from-emerald-400 to-teal-400"
          style={{
            top: `${i * 5}%`,
            width: "50%",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

// Floating Particles - use seeded positions to avoid hydration mismatch
function FloatingParticles() {
  const [particles, setParticles] = useState<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);

  useEffect(() => {
    // Generate random positions only on client side
    setParticles(
      [...Array(30)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-emerald-400/40"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
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
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

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
    <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="ml-1 inline-block h-[1em] w-[3px] bg-emerald-500 align-middle"
      />
    </span>
  );
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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
    if (!selectedGenome) return;

    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const chromosomeData = await getGenomeChromosomes(selectedGenome);
        setChromosomes(chromosomeData.chromosomes);

        console.log(
          "Fetched chromosomes for",
          selectedGenome,
          chromosomeData.chromosomes,
        );

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

      console.log(geneResults);
    } catch (err) {
      setError("Failed to search genes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChromosomes || mode !== "browse" || !selectedGenome) return;

    performGeneSearch(
      selectedChromosomes,
      selectedGenome,
      (gene: SingleGeneInfo) => gene.chromsome === selectedChromosomes,
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

    // ✨ 改进：自动选中第一个，而不是置空
    if (orgGenomes.length > 0) {
      setSelectedGenome(orgGenomes[0]!.id);
    } else {
      setSelectedGenome("");
    }
  };

  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
    setGeneSearchResults([]);
    setSelectedGene(null);
    setChromosomes([]);
    setselectedChromosomes("");
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
        (gene: SingleGeneInfo) => gene.chromsome === selectedChromosomes,
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
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Dna className="h-5 w-5" />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              GeneLM
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              asChild
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <a href="#">About Me</a>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <a href="#">My Projects</a>
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
              <a
                href="https://github.com/JarvisZhang24/GeneLM-Evo2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                <Button
                  size="sm"
                  className="bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  View Source
                </Button>
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                <Button variant="ghost" asChild className="justify-start">
                  <a href="#">About Me</a>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <a href="#">My Projects</a>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <a href="#tools">Tools</a>
                </Button>
                <div className="my-2 h-px bg-slate-200" />
                <Button
                  size="sm"
                  className="bg-linear-to-r from-emerald-600 to-teal-600 text-white"
                >
                  <Github className="mr-2 h-4 w-4" />
                  View Source
                </Button>
              </nav>
            </MotionDiv>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-b from-white via-slate-50/50 to-slate-50 pt-20 pb-16 lg:pt-28 lg:pb-28">
          {/* DNA Helix Background */}
          <DNAHelix />
          <FloatingParticles />

          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-6 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-emerald-200/60 bg-linear-to-r from-emerald-50 to-teal-50 px-4 py-2 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-emerald-700">
                Personal Research Project
              </span>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                A demonstration of using state-of-the-art language models for
                understanding genetic variants and evolutionary constraints.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="group gap-2 bg-linear-to-r from-emerald-600 to-teal-600 px-8 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
                onClick={() =>
                  document
                    .getElementById("tools")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-slate-300 px-8 hover:bg-slate-50"
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

            {/* Stats Section */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-emerald-300 hover:shadow-xl sm:p-6"
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 to-teal-50/50 opacity-0 transition-opacity group-hover:opacity-100" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-3"
            >
              {[
                {
                  icon: Zap,
                  label: "Real-time Analysis",
                  color: "text-yellow-500",
                },
                {
                  icon: Database,
                  label: "Multi-genome Support",
                  color: "text-blue-500",
                },
                { icon: Dna, label: "Gene Browser", color: "text-emerald-500" },
                {
                  icon: Cpu,
                  label: "H100 GPU Powered",
                  color: "text-purple-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-300 hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                  {feature.label}
                </motion.div>
              ))}
            </MotionDiv>
          </div>

          {/* Decorative gradient background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-linear-to-br from-emerald-100/40 to-teal-100/40 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-linear-to-tr from-cyan-100/40 to-blue-100/40 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-r from-purple-100/20 to-pink-100/20 blur-3xl" />
          </div>
        </section>

        {/* Dashboard / Tools Section */}
        <section
          id="tools"
          className="bg-linear-to-b from-slate-50 to-white py-16 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Genome Explorer
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Browse and search genes across multiple genome assemblies
              </p>
            </MotionDiv>

            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12">
              {/* Left Panel: Configuration */}
              <MotionDiv
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6 lg:col-span-4"
              >
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-6 w-1 rounded-full bg-linear-to-b from-emerald-500 to-teal-500" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Configuration
                  </h2>
                </div>

                <Card className="border-slate-200/80 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-slate-200/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-100 to-teal-100">
                        <Cpu className="h-4 w-4 text-emerald-600" />
                      </div>
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
                              className={`transition-all ${
                                organism === species
                                  ? "bg-linear-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/20 hover:shadow-lg"
                                  : "hover:border-emerald-300 hover:bg-emerald-50"
                              }`}
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
                        <SelectTrigger className="border-slate-200 focus:border-emerald-300 focus:ring-emerald-200">
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
                        <SelectTrigger className="border-slate-200 focus:border-emerald-300 focus:ring-emerald-200">
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
                        <div className="rounded-lg border border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 p-3 text-xs text-emerald-700">
                          <span className="font-medium">Source:</span>{" "}
                          {
                            genomes.find((g) => g.id === selectedGenome)
                              ?.sourceName
                          }
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </MotionDiv>

              {/* Right Panel: Interactive Area */}
              <MotionDiv
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6 lg:col-span-8"
              >
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-6 w-1 rounded-full bg-linear-to-b from-cyan-500 to-blue-500" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Exploration
                  </h2>
                </div>

                <Card className="min-h-[400px] border-slate-200/80 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-slate-200/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-base">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-cyan-100 to-blue-100">
                          <Activity className="h-4 w-4 text-cyan-600" />
                        </div>
                        Browser Interface
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Browse chromosomes or search genes in the selected genome.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Tabs
                      value={mode}
                      onValueChange={(value) => switchMode(value as Mode)}
                      className="w-full"
                    >
                      <TabsList className="w-full justify-start gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1">
                        <TabsTrigger
                          value="browse"
                          className="rounded-md px-4 py-2 font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                        >
                          Chromosomes
                        </TabsTrigger>
                        <TabsTrigger
                          value="search"
                          className="rounded-md px-4 py-2 font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                        >
                          Gene Search
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6">
                        <TabsContent value="search" className="m-0">
                          <GeneSearchTab
                            isLoading={isLoading}
                            searchResults={geneSearchResults}
                            onSearch={(query) =>
                              performGeneSearch(query, selectedGenome)
                            }
                            onGeneClick={handleGeneClick}
                          />
                        </TabsContent>

                        <TabsContent value="browse" className="m-0">
                          <ChromosomeBrowserTab
                            chromosomes={chromosomes}
                            selectedChromosome={selectedChromosomes}
                            onSelectChromosome={setselectedChromosomes}
                            geneResults={geneSearchResults}
                            isLoading={isLoading}
                            onGeneClick={handleGeneClick}
                          />
                        </TabsContent>
                      </div>

                      {error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {error}
                        </div>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Gene Detail Dialog */}
                <GeneDetailDialog
                  gene={selectedGene}
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                />
              </MotionDiv>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-linear-to-b from-white to-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20">
                GL
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">GeneLM</p>
                <p className="text-xs text-slate-500">
                  Built with ❤️ by Jarvis Zhang © 2025
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/JarvisZhang24"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
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
