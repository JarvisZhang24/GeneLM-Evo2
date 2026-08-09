"use client";

import { useRef, useState } from "react";
import {
  ArrowRight,
  Database,
  Dna,
  Github,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import { GeneDetailDialog } from "~/components/gene-detail-dialog";
import { GeneSearchTab } from "~/components/gene-search-tab";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { getGenes, type SingleGeneInfo } from "~/utils/genes-api";

const facts = [
  { value: "Evo2-7B", label: "Pretrained DNA language model" },
  { value: "8,192 bp", label: "Fixed scoring context" },
  { value: "GRCh38", label: "Supported reference assembly" },
  { value: "SNVs", label: "Current variant scope" },
];

export default function HomePage() {
  const explorerRef = useRef<HTMLElement>(null);
  const [results, setResults] = useState<SingleGeneInfo[]>([]);
  const [selectedGene, setSelectedGene] = useState<SingleGeneInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      setResults(await getGenes(query));
    } catch (searchError) {
      setResults([]);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Gene search failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#263b2b] text-white">
              <Dna className="h-5 w-5" />
            </span>
            GeneLM Evo2
          </a>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden border-amber-300 bg-amber-50 text-amber-900 sm:inline-flex"
            >
              Research use only
            </Badge>
            <Button
              asChild
              size="sm"
              className="bg-[#263b2b] text-white hover:bg-[#1d2e21]"
            >
              <a
                href="https://github.com/JarvisZhang24/GeneLM-Evo2"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="mr-2 h-4 w-4" /> Source
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(38,59,43,0.12),transparent_34%),linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
            <div>
              <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> Genomic variant
                research prototype
              </Badge>
              <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
                Explore human genes and compare SNVs with Evo2
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                A full-stack research interface that joins NCBI Gene, ClinVar,
                UCSC GRCh38 sequence data, and authenticated GPU inference. It
                reports model likelihood differences—not clinical diagnoses.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-[#263b2b] text-white hover:bg-[#1d2e21]"
                  onClick={() =>
                    explorerRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore genes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white"
                >
                  <a href="#architecture">View architecture</a>
                </Button>
              </div>
            </div>

            <Card className="self-center border-slate-200 bg-[#18231b] text-white shadow-2xl shadow-emerald-950/15">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-100">
                    Analysis contract
                  </p>
                  <LockKeyhole className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="mt-6 space-y-4 font-mono text-sm">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <span className="text-emerald-300">input</span> = GRCh38
                    genomic SNV
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <span className="text-emerald-300">score</span> = alternate
                    − reference likelihood
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <span className="text-emerald-300">scope</span> = research
                    interpretation only
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="text-xl font-bold text-[#263b2b]">{fact.value}</p>
                <p className="mt-1 text-sm text-slate-500">{fact.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          ref={explorerRef}
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mb-8">
            <p className="text-sm font-semibold tracking-wide text-emerald-800 uppercase">
              Human · GRCh38
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Gene explorer
            </h2>
            <p className="mt-2 text-slate-600">
              Search an NCBI human gene, inspect its reference sequence, load
              ClinVar SNVs, or click a base to score an alternative.
            </p>
          </div>
          {error ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <GeneSearchTab
            isLoading={loading}
            searchResults={results}
            onSearch={(query) => void search(query)}
            onGeneClick={setSelectedGene}
          />
        </section>

        <section
          id="architecture"
          className="border-t border-slate-200 bg-white"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {[
              {
                icon: Database,
                title: "Source-backed data",
                text: "NCBI Gene and ClinVar metadata are joined with UCSC GRCh38 reference bases using explicit coordinate conventions.",
              },
              {
                icon: LockKeyhole,
                title: "Protected inference",
                text: "The browser calls a same-origin Cloudflare route; Modal endpoint URLs and proxy credentials remain server-side secrets.",
              },
              {
                icon: Dna,
                title: "Honest model output",
                text: "Evo2 scores reference and alternate 8,192 bp contexts. The UI avoids unsupported clinical labels or confidence percentages.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <Icon className="h-6 w-6 text-[#263b2b]" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#f7f8f5] px-4 py-8 text-center text-sm text-slate-500">
        GeneLM Evo2 is a research and engineering demonstration. Not for
        clinical use.
      </footer>

      <GeneDetailDialog
        gene={selectedGene}
        open={selectedGene !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedGene(null);
        }}
        genomeId="hg38"
      />
    </div>
  );
}
