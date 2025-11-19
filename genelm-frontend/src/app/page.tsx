"use client";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardAction, CardFooter } from "~/components/ui/card";
import { useEffect, useState } from "react";
import {
  type SingleGenomeInfo,
  getAvailableGenomeAssemblies
} from "~/utils/genome-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function HomePage() {

  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState<string | null>(null);


  const [genomes, setGenomes] = useState<SingleGenomeInfo[]>([])

  const [organism, setOrganism] = useState<string>("Human")

  const [selectedGenome, setSelectedGenome] = useState<string>("hg38")

  const [genomesByOrganism, setGenomesByOrganism] = useState<
    Record<string, SingleGenomeInfo[]>
  >({});


  useEffect(() => {

    const fetchGenomeAssemblies = async () => {
      try {

        setIsLoading(true)

        const genomesData = await getAvailableGenomeAssemblies();

        setGenomesByOrganism(genomesData.genomes);

        if (genomesData.genomes && genomesData.genomes["Human"]) {
          setGenomes(genomesData.genomes["Human"])
        }

        console.log("Available Genome Assemblies:", genomesData);

      } catch (error) {
        setError("Failed to fetch genomes");
      } finally {
        setIsLoading(false);
      }



    }
    fetchGenomeAssemblies();

  }, []);

  const handleOrganismChange = (value: string) => {
    setOrganism(value);

    const orgGenomes = genomesByOrganism[value] ?? [];
    setGenomes(orgGenomes);

    // 切换物种时，默认选中该物种的第一个基因组
    if (orgGenomes.length > 0) {
      setSelectedGenome(orgGenomes[0].id);
    } else {
      setSelectedGenome("");
    }
  };


  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
  }


  return (

    <div className="min-h-screen bg-gradient-to-br from-[#dfe9f3] via-[#e9eeea] to-[#f7f7f7]">
      {/* 顶部导航条 */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3c4f3d] text-xs font-semibold text-white shadow-sm">
              GenLM
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#1f2933]">
                GenLM · Variant Analysis
              </p>
              <p className="text-xs text-[#6b7280]">
                Genetic insights powered by Stanford Ev2 Model
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#3c4f3d]/5 px-3 py-1 text-xs font-medium text-[#3c4f3d]">
              Jarvis&apos;s Biomedical Project
            </span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16">
        <h1 className="mb-6 text-center text-4xl font-bold text-[#111827]">
          Gene Variant Analysis
        </h1>
        <p className="mb-10 max-w-2xl text-center text-lg text-[#374151]">
          Leverage the power of Stanford&apos;s Ev2 model to analyze genetic variants and gain actionable insights for biomedical research.
        </p>

        {/* <Card className="w-180">
          <CardHeader>
            <CardTitle>Genome Assembly</CardTitle>
            <CardDescription>
              Select the reference genome assembly for your analysis.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Select
              value={selectedGenome}
              onValueChange={handleGenomeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="select genome assembly">
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {genomes.map((genome) => (
                  <SelectItem key={genome.id} value={genome.id}>

                    {genome.id} - {genome.description}
                    {genome.active ? "(active)" : "(inactive)"}

                  </SelectItem>
                ))}
              </SelectContent>


            </Select>

            {
              selectedGenome &&
              (
                <p className="mt-2 text-xs">
                  {
                    genomes.find((genomes) => genomes.id === selectedGenome)?.sourceName
                  }
                </p>

              )

            }



          </CardContent>

        </Card> */}
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Genome Assembly</CardTitle>
            <CardDescription>
              First choose an organism, then select a reference genome assembly
              for your analysis.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 1. 选择物种 */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#111827]">Organism</p>
              <Select
                value={organism}
                onValueChange={handleOrganismChange}
                disabled={isLoading || Object.keys(genomesByOrganism).length === 0}
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

            {/* 2. 选择该物种下的基因组 */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#111827]">
                Genome Assembly
              </p>
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
                      {genome.id} - {genome.description}{" "}
                      {genome.active ? "(active)" : "(inactive)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedGenome && (
                <p className="mt-2 text-xs text-[#4b5563]">
                  {
                    genomes.find((g) => g.id === selectedGenome)
                      ?.sourceName
                  }
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-600">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

      </main>


    </div>

  );
}
