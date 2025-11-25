import { data } from "framer-motion/client";

export async function fetchGeneSequence(
  chromosome: string,
  startpos: number,
  endpos: number,
  genomeId: string,
): Promise<{
  sequence: string;
  actualRange: { startpos: number , endpos: number };
  error?: string;
}> {
    try {
        const chrom = chromosome.startsWith("chr")
        ? chromosome
        : `chr${chromosome}`;

        const apiStart = startpos - 1

        const apiEnd = endpos

        const geneSequenceUrl = `https://api.genome.ucsc.edu/getData/sequence?genome=${genomeId};chrom=${chrom};start=${apiStart};end=${apiEnd}`;
        const geneSequenceResponse = await fetch(geneSequenceUrl);
        const geneSequenceData = await geneSequenceResponse.json();

        const actualRange = {startpos , endpos}

        if(geneSequenceData.error || !geneSequenceData.dna){
            return { sequence: "", actualRange, error: geneSequenceData.error }
        }

        const geneSequence = geneSequenceData.dna.toUpperCase()

        return {sequence:geneSequence , actualRange}
        
    } catch (error) {
        return { sequence: "", actualRange:{startpos ,endpos}, error: "internal error in fetch gene sequence" }
        
    }


}
