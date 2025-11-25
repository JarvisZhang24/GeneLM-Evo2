// export interface SingleGeneInfo {
//   symbol: string;
//   chromsome: string;
//   description: string;
//   gene_id?: string;
//   type_of_gene : string
// }

// export async function getGenes(query: string, genome: string) {
//   const getGenesUrl =
//     "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search";

//   const getGenesParams = new URLSearchParams({
//     terms: query,
//     df: "chromosome,Symbol,description,map_location,type_of_gene",
//     ef: "chromosome,Symbol,description,map_location,type_of_gene,GenomicInfo,GeneID",
//   });

//   const getGenesResponse = await fetch(`${getGenesUrl}?${getGenesParams}`);

//   if (!getGenesResponse.ok) throw new Error("NCBI API Error");

//   const genesData = await getGenesResponse.json();

//   const genesResult: SingleGeneInfo[] = [];

// 	if(genesData[0] > 0){
//     const fieldMap = genesData[2]

//     const geneIds = fieldMap.GeneID || []

//     for (let i = 0; i < Math.min(10 , genesData[0]) ; ++i){
//       if (i < genesData[3].length){
//         try {
//           const geneData = genesData[3][i]

//           let chrom = geneData[0]

//           if(chrom && !chrom.startsWith("chr")){
//             chrom = `chr${chrom}`
//           }

//           genesResult.push({
//             chromsome : chrom,
//             gene_id :geneIds[i] ||"",
//             symbol : geneData[1],
//             description:geneData[2],
//             type_of_gene:geneData[4]
//           }) 

//         } catch {
//           continue
          
//         }

//       }
//     }
		
// 	}

//   return {query , genome , genesResult}

// }


export interface SingleGeneInfo {
  symbol: string;
  chromsome: string;
  description: string;
  gene_id?: string;
  type_of_gene: string;
}

export async function getGenes(query: string, genome: string) {
  const baseUrl = "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search";

  // 使用纯 ef，不再使用 df
  const params = new URLSearchParams({
    terms: query,
    ef: "chromosome,Symbol,description,map_location,type_of_gene,GeneID"
  });

  const res = await fetch(`${baseUrl}?${params.toString()}`);

  if (!res.ok) throw new Error("NCBI API Error");

  const genesData = await res.json();

  const total = genesData[0];
  const fieldMap = genesData[2];

  if (!total || !fieldMap) {
    return { query, genome, genesResult: [] };
  }

  const chromosomes = fieldMap.chromosome || [];
  const symbols = fieldMap.Symbol || [];
  const descriptions = fieldMap.description || [];
  const types = fieldMap.type_of_gene || [];
  const geneIds = fieldMap.GeneID || [];

  const genesResult: SingleGeneInfo[] = [];

  const count = Math.min(10, total);

  for (let i = 0; i < count; i++) {
    let chrom = chromosomes[i] || "";

    if (chrom && !chrom.startsWith("chr")) {
      chrom = `chr${chrom}`;
    }

    genesResult.push({
      chromsome: chrom,
      symbol: symbols[i] || "",
      description: descriptions[i] || "",
      type_of_gene: types[i] || "",
      gene_id: geneIds[i] || ""
    });
  }

  return { query, genome, genesResult };
}