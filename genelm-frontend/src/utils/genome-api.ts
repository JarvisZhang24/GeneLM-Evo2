
export interface SingleGenomeInfo {
  id: string;
  description: string;
  active: boolean;
  sourceName: string;

}

export async function getAvailableGenomeAssemblies() {
  const genomesApiUrl = "https://api.genome.ucsc.edu/list/ucscGenomes"

  const genomesApiResponse  = await fetch(genomesApiUrl)

  if(!genomesApiResponse.ok){
    throw new Error(`Error fetching genome assemblies: ${genomesApiResponse.statusText}`)
  }

  const genomesApiData = await genomesApiResponse.json()

  if(!genomesApiData.ucscGenomes){
    throw new Error(`Error fetching genome assemblies: ${genomesApiResponse.statusText}`);
  }

  const genomesData = await genomesApiData.ucscGenomes

  const structuredGenomes: Record<string , SingleGenomeInfo[]> = {}

  for(const genomeId in genomesData){
    const genomeInfo = genomesData[genomeId]

    const organism = genomeInfo.organism || "Other"

    if(!structuredGenomes[organism]) structuredGenomes[organism] = []
    structuredGenomes[organism].push({
            id: genomeId,
            description: genomeInfo.description || genomeId,
            sourceName: genomeInfo.sourceName || genomeId,
            active: !!genomeInfo.active, // Convert 1 to true and 0 to false
    });
    
  }

  return{genomes:structuredGenomes}
}