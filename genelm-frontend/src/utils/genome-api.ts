export interface GenomeFromUCSC {
  id: string;
  name: string;
  active: string;
}




export async function getAvailableGenomeAssemblies() {
  const apiUrl = "https://api.genome.ucsc.edu/list/ucscGenomes"
  const genomeResponse = await fetch(apiUrl);
  if (!genomeResponse.ok) {
    throw new Error(`Error fetching genome assemblies: ${genomeResponse.statusText}`);
  }

  const genomeData = await genomeResponse.json
  

  











}