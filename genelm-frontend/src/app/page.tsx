"use client";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "~/components/ui/card";
import { useEffect, useState } from "react";

import {
  type SingleGenomeInfo,
  getAvailableGenomeAssemblies
} from "~/utils/genome-api";

import{
  type SingleChromosomeInfo,
  getGenomeChromosomes
} from "~/utils/chromosomes-api"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Car, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";


type Mode = "browse" | "search"

export default function HomePage() {

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState<string | null>("test error");

  const [organism, setOrganism] = useState<string>("Human")

  const [genomes, setGenomes] = useState<SingleGenomeInfo[]>([])

  const [chromosomes , setChromosomes  ] = useState<SingleChromosomeInfo[]>([])

  const [selectedGenome, setSelectedGenome] = useState<string>("hg38")

  const [selectedChromosomes , setselectedChromosomes] = useState<string>("")

  const [genomesByOrganism, setGenomesByOrganism] = useState<
    Record<string, SingleGenomeInfo[]>
  >({});

  const [searchQuery ,setSearchQuery ] = useState<string>("") 

  const [mode, setMode] = useState<Mode>("search")



 // select genome
  useEffect(() => {

    const fetchGenomeAssemblies = async () => {
      try {

        setIsLoading(true)

        const genomesData = await getAvailableGenomeAssemblies();

        setGenomesByOrganism(genomesData.genomes);

        //Set default genomes
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

  // select chromosomes
  useEffect(() => {

    const fetchChromosomes = async () => {
      try {

        setIsLoading(true)

        const chromosomeData = await getGenomeChromosomes(selectedGenome)

        setChromosomes(chromosomeData.chromosomes)

        console.log(chromosomeData.chromosomes)

        if(chromosomeData.chromosomes.length > 0){
          setselectedChromosomes(chromosomeData.chromosomes[0]!.name)
        }
        

      } catch (error) {
        setError(`Failed to fetch Chromosomes ${error}`);
      } finally {
        setIsLoading(false);
      }

    }

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
  }

  const switchMode = (newMode : Mode) =>{
    if(newMode === mode ) return

    setMode(newMode)
  }

  const loadBRCA1Example = () =>{
    setMode("search")

    setSearchQuery("BRCA1")

    //

  }

  const handleSearchQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    if(!searchQuery.trim()) return

    // perform gene search




    
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
              <p className="text-x font-semibold text-[#1f2933]">
                GenLM · Variant Analysis
              </p>
              <p className="text-x text-[#6b7280]">
                Genetic insights powered by Stanford Ev2 Model
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#3c4f3d]/5 px-3 py-1 text-xl font-medium text-[#3c4f3d]">
              Jarvis&apos;s Biomedical Project
            </span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16">
        <h1 className="mb-6 text-center text-4xl font-bold text-[#111827]">
          Gene Variant Analysis
        </h1>
        <p className="mb-10 max-w-2xl text-center text-lg text-[#374151]">
          Leverage the power of Stanford&apos;s Ev2 model to analyze genetic variants and gain actionable insights for biomedical research.
        </p>

        <div className="grid w-full gap-6 md:grid-cols-2">
          <Card className="w-full">
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
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Human', 'Gorilla', 'Horse', 'Dog', 'Cat'].map((species) => (
                    <Button
                      key={species}
                      variant={organism === species ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleOrganismChange(species)}
                      disabled={!Object.keys(genomesByOrganism).includes(species)}
                    >
                      {species}
                    </Button>
                  ))}
                </div>
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

        
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Browse Chromosomes</CardTitle>
              <CardDescription>
                
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={mode} onValueChange={(value) => switchMode(value as Mode)}>
                <TabsList>
                  <TabsTrigger value="search">
                    Search Genes
                  </TabsTrigger>

                  <TabsTrigger value="browse">
                    Browse Chromosomes
                  </TabsTrigger>

                </TabsList>

                <TabsContent value="search" className="mt-4">
                  <form onSubmit={handleSearchQuery} className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Enter gene symbol or name" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button type = "submit" className="gap-2 px-4" disabled = {isLoading || !searchQuery.trim()}>
                        <Search className="h-4 w-4" />
                        <span>Search</span>
                      </Button>
                    </div>
                  </form>

                  <Button 
                  variant= "link" 
                  className="gap-2 px-4"
                  onClick={loadBRCA1Example}
                  >
                    Try BRCA1 Example
                  </Button>
                </TabsContent>

                <TabsContent value="browse" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select a chromosome to browse
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chromosomes
                        .filter((chrom) => chrom.name.startsWith('chr'))
                        .map((chrom) => (
                          <Button 
                            key={chrom.name} 
                            variant="outline"
                            onClick={() => setselectedChromosomes(chrom.name)}
                            className={selectedChromosomes === chrom.name ? "border-primary bg-primary/10" : ""}
                          >
                            {chrom.name}
                          </Button>
                        ))}
                    </div>
                    {selectedChromosomes && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">
                          Selected: {selectedChromosomes}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

            </CardContent>
          </Card>
        </div>

      </main>


    </div>

  );
}
