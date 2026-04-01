"use client";

import { Button } from "~/components/ui/button";
import {
  Dna,
  Github,
  ArrowRight,
  Database,
  Zap,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const MotionDiv = motion.div;

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(60,79,61,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(15,23,42,0.06),transparent_60%)]" />
      <div className="absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full bg-linear-to-br from-[#3c4f3d]/18 to-emerald-200/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-linear-to-tr from-slate-200/25 to-slate-100/5 blur-3xl" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 to-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
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

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              asChild
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Link href="/analyze">Analyze</Link>
            </Button>
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

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-linear-to-b from-white via-slate-50/60 to-slate-50 pt-24 pb-20 lg:pt-36 lg:pb-32">
          <HeroBackdrop />

          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
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
              <span className="text-sm text-slate-400">&middot;</span>
              <span className="text-sm text-slate-600">Evo2 integrated</span>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Zero-Shot Variant Pathogenicity
                <br className="hidden sm:block" />
                <span className="bg-linear-to-r from-[#3c4f3d] via-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  Powered by Evo2
                </span>
              </h1>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Browse public genome data, surface ClinVar evidence, and run
                Evo2 large-model inference on clinically curated SNVs — all in
                one workflow.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="group gap-2 bg-[#3c4f3d] px-8 text-white shadow-sm transition-colors hover:bg-[#2d3f2e]"
                asChild
              >
                <Link href="/analyze">
                  Start Analysis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
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
                  <Github className="h-4 w-4" /> View Source
                </a>
              </Button>
            </MotionDiv>
          </div>
        </section>

        {/* Why Evo2 */}
        <section className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Why Evo2 for Variant Analysis?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
                Evo2 is a 7-billion-parameter DNA language model that scores
                genetic variants by comparing log-likelihoods of reference vs.
                alternate sequences — no task-specific training required.
              </p>
            </MotionDiv>

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Dna,
                  title: "7B Parameter Model",
                  description:
                    "Trained on diverse genomic data with an 8,192 bp context window, capturing long-range sequence dependencies.",
                },
                {
                  icon: Zap,
                  title: "Zero-Shot Prediction",
                  description:
                    "No fine-tuning needed. Evo2 scores any SNV by comparing reference and variant sequence likelihoods on H100 GPUs.",
                },
                {
                  icon: Database,
                  title: "ClinVar Integration",
                  description:
                    "Curated clinical variants are fetched directly from NCBI ClinVar, giving you ground-truth labels for instant comparison.",
                },
              ].map((item, i) => (
                <MotionDiv
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3c4f3d] text-white shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="border-t border-slate-200/60 bg-linear-to-b from-slate-50 to-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Three Steps to Insight
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
                From gene discovery to AI-powered variant classification in one
                seamless workflow.
              </p>
            </MotionDiv>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Search,
                  title: "Discover Genes",
                  description:
                    "Select an organism and genome assembly, then browse chromosomes or search by gene symbol to find your target.",
                },
                {
                  step: "02",
                  icon: Database,
                  title: "Surface Evidence",
                  description:
                    "ClinVar variants are automatically fetched for your gene, showing clinical significance, variant type, and genomic position.",
                },
                {
                  step: "03",
                  icon: Zap,
                  title: "Run Evo2 Inference",
                  description:
                    "One click triggers Evo2 pathogenicity prediction on any SNV — compare the AI result against the ClinVar label instantly.",
                },
              ].map((item, i) => (
                <MotionDiv
                  key={item.step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="relative rounded-2xl border border-slate-200/70 bg-white p-6"
                >
                  <span className="font-mono text-xs font-bold tracking-widest text-emerald-600 uppercase">
                    Step {item.step}
                  </span>
                  <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#3c4f3d]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </MotionDiv>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="group gap-2 bg-[#3c4f3d] px-8 text-white shadow-sm transition-colors hover:bg-[#2d3f2e]"
                asChild
              >
                <Link href="/analyze">
                  Open Workspace
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
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
                &copy; 2025 Jarvis Zhang
              </span>
            </div>

            <div className="flex items-center gap-6">
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
