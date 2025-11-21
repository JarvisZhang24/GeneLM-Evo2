export interface SingleChromosomeInfo {
  name: string;
  size: number;
}

export async function getGenomeChromosomes(genomeId: string) {
  const chromosomesApiUrl = `https://api.genome.ucsc.edu/list/chromosomes?genome=${genomeId}`;

  const chromosomesApiResponse = await fetch(chromosomesApiUrl);

  if (!chromosomesApiResponse.ok) {
    throw new Error("Failed to fetch Chromosomes from UCSC API");
  }

  const chromosomesData = await chromosomesApiResponse.json();

  if (!chromosomesData.chromosomes) {
    throw new Error("Missing Chromosomes Data");
  }

  const chromosomes: SingleChromosomeInfo[] = [];

  for (const chromosomesId in chromosomesData.chromosomes) {
    if (
      chromosomesId.includes("_") ||
      chromosomesId.includes("Un") ||
      chromosomesId.includes("random")
    )
      continue;

    chromosomes.push({
      name: chromosomesId,
      size: chromosomesData.chromosomes[chromosomesId],
    });
  }

  chromosomes.sort((a, b) => {
    const anum = a.name.replace("chr", "");
    const bnum = b.name.replace("chr", "");

    const isNumA = /^\d+$/.test(anum);
    const isNumB = /^\d+$/.test(bnum);

    if (isNumA && isNumB) return Number(anum) - Number(bnum);

    if (isNumA) {
      return -1;
    }
    if (isNumB) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

  return { chromosomes };
}
