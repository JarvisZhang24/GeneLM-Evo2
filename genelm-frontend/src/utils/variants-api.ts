import { z } from "zod";

import { fetchReferenceBase } from "./gene-sequence-api";
import type { GeneBounds } from "./gene-details-api";
import {
  analysisResultSchema,
  type AnalysisResult,
  type VariantRequest,
} from "./variant-schema";

export type { AnalysisResult } from "./variant-schema";

export interface ClinvarVariant {
  clinvar_id: string;
  title: string;
  variation_type: string;
  classification: string;
  gene_sort: string;
  chromosome: string;
  location: string;
  evo2Result?: AnalysisResult;
  isAnalyzing?: boolean;
  evo2Error?: string;
}

const esearchSchema = z.object({
  esearchresult: z.object({ idlist: z.array(z.string()) }),
});
const summarySchema = z.object({
  result: z.object({ uids: z.array(z.string()) }).catchall(z.unknown()),
});

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export async function fetchClinvarVariants(
  chromosome: string,
  geneBounds: GeneBounds,
): Promise<ClinvarVariant[]> {
  const chrom = chromosome.replace(/^chr/i, "");
  const searchParams = new URLSearchParams({
    db: "clinvar",
    term: `${chrom}[chromosome] AND ${geneBounds.min}:${geneBounds.max}[chrpos38]`,
    retmode: "json",
    retmax: "20",
  });
  const searchResponse = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`,
  );
  if (!searchResponse.ok) throw new Error("ClinVar search failed");
  const ids = esearchSchema.parse(await searchResponse.json()).esearchresult
    .idlist;
  if (ids.length === 0) return [];

  const summaryParams = new URLSearchParams({
    db: "clinvar",
    id: ids.join(","),
    retmode: "json",
  });
  const response = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`,
  );
  if (!response.ok) throw new Error("ClinVar summary request failed");
  const result = summarySchema.parse(await response.json()).result;

  return result.uids.flatMap((id): ClinvarVariant[] => {
    const raw = result[id];
    if (!raw || typeof raw !== "object") return [];
    const record = raw as Record<string, unknown>;
    const classification = record.germline_classification;
    const classificationDescription =
      classification && typeof classification === "object"
        ? (classification as Record<string, unknown>).description
        : undefined;
    const locationValue = record.location_sort;
    return [
      {
        clinvar_id: id,
        title:
          typeof record.title === "string" ? record.title : "Untitled variant",
        variation_type: titleCase(
          typeof record.obj_type === "string" ? record.obj_type : "unknown",
        ),
        classification:
          typeof classificationDescription === "string"
            ? classificationDescription
            : "Unknown",
        gene_sort: typeof record.gene_sort === "string" ? record.gene_sort : "",
        chromosome: `chr${chrom}`,
        location:
          typeof locationValue === "number" || typeof locationValue === "string"
            ? Number(locationValue).toLocaleString()
            : "Unknown",
      },
    ];
  });
}

const complement: Record<string, "A" | "C" | "G" | "T"> = {
  A: "T",
  T: "A",
  C: "G",
  G: "C",
};

export function orientAllelesToGrch38(
  transcriptReference: string,
  transcriptAlternate: string,
  genomicReference: "A" | "C" | "G" | "T",
): { reference: "A" | "C" | "G" | "T"; alternative: "A" | "C" | "G" | "T" } {
  const reference = transcriptReference.toUpperCase();
  const alternate = transcriptAlternate.toUpperCase();
  if (!complement[reference] || !complement[alternate]) {
    throw new Error("Variant alleles must be single DNA bases");
  }
  if (reference === genomicReference) {
    return {
      reference: genomicReference,
      alternative: alternate as "A" | "C" | "G" | "T",
    };
  }
  if (complement[reference] === genomicReference) {
    return {
      reference: genomicReference,
      alternative: complement[alternate],
    };
  }
  throw new Error("ClinVar allele does not match the GRCh38 reference strand");
}

export function isResolvableClinvarSnv(variant: ClinvarVariant): boolean {
  return /([ACGT])>([ACGT])/i.test(variant.title);
}

export async function resolveClinvarSnv(variant: ClinvarVariant): Promise<{
  position: number;
  reference: "A" | "C" | "G" | "T";
  alternative: "A" | "C" | "G" | "T";
}> {
  const alleleMatch = /([ACGT])>([ACGT])/i.exec(variant.title);
  const position = Number(variant.location.replaceAll(",", ""));
  if (!alleleMatch?.[1] || !alleleMatch[2] || !Number.isInteger(position)) {
    throw new Error(
      "ClinVar record is not a resolvable single-nucleotide variant",
    );
  }

  const transcriptReference = alleleMatch[1].toUpperCase();
  const transcriptAlternate = alleleMatch[2].toUpperCase();
  const genomicReference = (await fetchReferenceBase(
    variant.chromosome,
    position,
  )) as "A" | "C" | "G" | "T";
  return {
    position,
    ...orientAllelesToGrch38(
      transcriptReference,
      transcriptAlternate,
      genomicReference,
    ),
  };
}

export async function analyzeVariantWithAPI(input: {
  position: number;
  alternative: "A" | "C" | "G" | "T";
  reference?: "A" | "C" | "G" | "T";
  chromosome: string;
}): Promise<AnalysisResult> {
  const request: VariantRequest = {
    variant_pos: input.position,
    alt_allele: input.alternative,
    expected_ref: input.reference,
    genome: "hg38",
    chromosome: input.chromosome,
  } as VariantRequest;
  const response = await fetch("/api/analyze-variant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const payload = await response.json();
  if (!response.ok) {
    const parsedError = z.object({ error: z.string() }).safeParse(payload);
    throw new Error(
      parsedError.success ? parsedError.data.error : "Analysis failed",
    );
  }
  if (response.status === 200) return analysisResultSchema.parse(payload);

  const submitted = z
    .object({ status: z.literal("pending"), job_token: z.string().min(1) })
    .parse(payload);
  for (let attempt = 0; attempt < 150; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    const resultResponse = await fetch(
      `/api/analyze-variant?job=${encodeURIComponent(submitted.job_token)}`,
      { cache: "no-store" },
    );
    const resultPayload = await resultResponse.json();
    if (resultResponse.status === 202) continue;
    if (!resultResponse.ok) {
      const parsedError = z
        .object({ error: z.string() })
        .safeParse(resultPayload);
      throw new Error(
        parsedError.success ? parsedError.data.error : "Analysis failed",
      );
    }
    return analysisResultSchema.parse(resultPayload);
  }

  throw new Error("Analysis timed out after five minutes");
}
