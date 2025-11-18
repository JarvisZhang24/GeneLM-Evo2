export interface GenomeFromUCSC {
  id: string;
  description: string;
  active: boolean;
  sourceName: string;
}



export async function getAvailableGenomeAssemblies() {
  const apiUrl = "https://api.genome.ucsc.edu/list/ucscGenomes"
  const genomeResponse = await fetch(apiUrl);
  if (!genomeResponse.ok) {
    throw new Error(`Error fetching genome assemblies: ${genomeResponse.statusText}`);
  }

  const genomeData = await genomeResponse.json()
  if(!genomeData.ucscGenomes){
    throw new Error(`Error fetching genome assemblies: ${genomeResponse.statusText}`);
  }


  const  genomes = genomeData.ucscGenomes

  const structuredGenomes: Record<string, GenomeFromUCSC[]> = {}

  for(const genomeId in genomes){
    const genomeInfo = genomes[genomeId]

    const organism = genomeInfo.organism || "Other";

    if(!structuredGenomes[organism]) structuredGenomes[organism] = [];

    structuredGenomes[organism].push({
            id: genomeId,
            description: genomeInfo.description || genomeId,
            sourceName: genomeInfo.sourceName || genomeId,
            active: !!genomeInfo.active, // Convert 1 to true and 0 to false
    });

  }
  
  return{genomes:structuredGenomes}

}