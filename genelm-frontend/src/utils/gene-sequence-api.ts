import { z } from "zod";

const sequenceResponseSchema = z.object({
  dna: z.string().optional(),
  error: z.string().optional(),
});

export async function fetchGeneSequence(
  chromosome: string,
  startPosition: number,
  endPosition: number,
): Promise<{
  sequence: string;
  actualRange: { startpos: number; endpos: number };
}> {
  if (startPosition < 1 || endPosition < startPosition) {
    throw new Error("Sequence coordinates must be 1-based and inclusive");
  }
  const chrom = chromosome.startsWith("chr") ? chromosome : `chr${chromosome}`;
  const params = new URLSearchParams({
    genome: "hg38",
    chrom,
    start: String(startPosition - 1),
    end: String(endPosition),
  });
  const response = await fetch(
    `https://api.genome.ucsc.edu/getData/sequence?${params}`,
  );
  if (!response.ok) throw new Error("UCSC sequence request failed");
  const payload = sequenceResponseSchema.parse(await response.json());
  if (!payload.dna)
    throw new Error(payload.error ?? "UCSC returned no DNA sequence");

  const sequence = payload.dna.toUpperCase();
  const expectedLength = endPosition - startPosition + 1;
  if (sequence.length !== expectedLength) {
    throw new Error(
      `UCSC returned ${sequence.length} bp; expected ${expectedLength} bp`,
    );
  }
  return {
    sequence,
    actualRange: { startpos: startPosition, endpos: endPosition },
  };
}

export async function fetchReferenceBase(chromosome: string, position: number) {
  const result = await fetchGeneSequence(chromosome, position, position);
  return result.sequence;
}
