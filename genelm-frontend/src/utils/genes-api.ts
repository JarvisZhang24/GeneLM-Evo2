import { z } from "zod";

export const SUPPORTED_GENOME = "hg38" as const;

export interface SingleGeneInfo {
  symbol: string;
  chromosome: string;
  description: string;
  gene_id: string;
  type_of_gene: string;
}

const clinicalTablesSchema = z.tuple([
  z.number(),
  z.array(z.string()),
  z.record(z.array(z.union([z.string(), z.number(), z.null()]))),
  z.array(z.unknown()).optional(),
]);

const geneSummarySchema = z.object({
  result: z
    .object({ uids: z.array(z.string()).optional() })
    .catchall(z.unknown()),
});

function normalizeChromosome(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "";
  return value.toLowerCase().startsWith("chr") ? value : `chr${value}`;
}

function valueAt(
  values: Array<string | number | null> | undefined,
  index: number,
) {
  const value = values?.[index];
  return value == null ? "" : String(value);
}

export async function getGenes(query: string): Promise<SingleGeneInfo[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const params = new URLSearchParams({
    terms: trimmedQuery,
    count: "10",
    ef: "chromosome,Symbol,description,type_of_gene,GeneID",
  });
  const response = await fetch(
    `https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?${params}`,
  );
  if (!response.ok) throw new Error("NCBI gene search failed");

  const [, , fields] = clinicalTablesSchema.parse(await response.json());
  const count = Math.min(10, fields.GeneID?.length ?? 0);
  return Array.from({ length: count }, (_, index) => ({
    gene_id: valueAt(fields.GeneID, index),
    symbol: valueAt(fields.Symbol, index),
    chromosome: normalizeChromosome(valueAt(fields.chromosome, index)),
    description: valueAt(fields.description, index),
    type_of_gene: valueAt(fields.type_of_gene, index),
  })).filter((gene) => gene.gene_id && gene.chromosome);
}

export async function getGeneById(geneId: string): Promise<SingleGeneInfo> {
  if (!/^\d+$/.test(geneId)) throw new Error("Gene ID must be numeric");
  const params = new URLSearchParams({
    db: "gene",
    id: geneId,
    retmode: "json",
  });
  const response = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${params}`,
  );
  if (!response.ok) throw new Error("NCBI gene lookup failed");

  const parsed = geneSummarySchema.parse(await response.json());
  const record = parsed.result[geneId];
  if (!record || typeof record !== "object") throw new Error("Gene not found");
  const data = record as Record<string, unknown>;
  const chromosome = normalizeChromosome(data.chromosome);
  if (!chromosome) throw new Error("No chromosome is available for this gene");

  return {
    gene_id: geneId,
    symbol: typeof data.name === "string" ? data.name : geneId,
    chromosome,
    description: typeof data.description === "string" ? data.description : "",
    type_of_gene:
      typeof data.genetic_source === "string" ? data.genetic_source : "gene",
  };
}
