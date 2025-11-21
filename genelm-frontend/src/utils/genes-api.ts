export interface SingleGeneInfo {
  symbol: string;
  name: string;
  chrom: string;
  description: string;
  gene_id?: string;
}

export async function getGenes(query: string, genome: string) {
  const getGenesUrl =
    "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search";

  const getGenesParams = new URLSearchParams({
    terms: query,
    df: "chromosome,Symbol,description,map_location,type_of_gene",
    ef: "chromosome,Symbol,description,map_location,type_of_gene,GenomicInfo,GeneID",
  });

  const getGenesResponse = await fetch(`${getGenesUrl}?${getGenesParams}`);

  if (!getGenesResponse.ok) throw new Error("NCBI API Error");

  const genesData = await getGenesResponse.json();

  const genesResult: SingleGeneInfo[] = [];

	if(genesData[0] > 0){
		
	}
}
