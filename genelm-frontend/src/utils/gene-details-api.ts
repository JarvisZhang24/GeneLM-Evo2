import { z } from "zod";

export interface GeneBounds {
  /** 1-based, inclusive GRCh38 coordinates. */
  min: number;
  max: number;
}

export interface GeneDetailsFromSearch {
  genomicinfo?: Array<{
    chrstart: number;
    chrstop: number;
    strand: "+" | "-";
  }>;
  summary?: string;
  organism?: { scientificname: string; commonname: string };
}

const genomicInfoSchema = z.object({
  chrstart: z.number(),
  chrstop: z.number(),
});
const detailSchema = z.object({
  genomicinfo: z.array(genomicInfoSchema).optional(),
  summary: z.string().optional(),
  organism: z
    .object({ scientificname: z.string(), commonname: z.string() })
    .optional(),
});

export async function fetchGeneDetails(geneId: string): Promise<{
  geneDetails: GeneDetailsFromSearch;
  geneBounds: GeneBounds;
  initialRange: { start: number; end: number };
}> {
  const params = new URLSearchParams({
    db: "gene",
    id: geneId,
    retmode: "json",
  });
  const response = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${params}`,
  );
  if (!response.ok) throw new Error("NCBI gene details request failed");

  const payload = await response.json();
  const result = z.object({ result: z.record(z.unknown()) }).parse(payload)
    .result[geneId];
  const detail = detailSchema.parse(result);
  const info = detail.genomicinfo?.[0];
  if (!info) throw new Error("No GRCh38 genomic coordinates were returned");

  // NCBI Gene coordinates are zero-based inclusive. The UI uses 1-based inclusive.
  const min = Math.min(info.chrstart, info.chrstop) + 1;
  const max = Math.max(info.chrstart, info.chrstop) + 1;
  const strand = info.chrstart <= info.chrstop ? "+" : "-";
  return {
    geneDetails: {
      ...detail,
      genomicinfo: [{ ...info, strand }],
    },
    geneBounds: { min, max },
    initialRange: { start: min, end: Math.min(max, min + 9_999) },
  };
}
