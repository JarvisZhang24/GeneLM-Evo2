export interface SingleGeneInfo {
  symbol: string;
  chromsome: string;
  description: string;
  gene_id?: string;
  type_of_gene : string
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
    const fieldMap = genesData[2]

    const geneIds = fieldMap.GeneID || []

    for (let i = 0; i < Math.min(10 , genesData[0]) ; ++i){
      if (i < genesData[3].length){
        try {
          const geneData = genesData[3][i]

          let chrom = geneData[0]

          if(chrom && !chrom.startsWith("chr")){
            chrom = `chr${chrom}`
          }

          genesResult.push({
            chromsome : chrom,
            gene_id :geneIds[i] ||"",
            symbol : geneData[1],
            description:geneData[2],
            type_of_gene:geneData[4]
          }) 

        } catch {
          continue
          
        }

      }
    }
		
	}

  return {query , genome , genesResult}

}


