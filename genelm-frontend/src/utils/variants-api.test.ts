import { describe, expect, it } from "vitest";

import { orientAllelesToGrch38 } from "./variants-api";
import { variantRequestSchema } from "./variant-schema";

describe("ClinVar allele orientation", () => {
  it("keeps forward-strand alleles", () => {
    expect(orientAllelesToGrch38("A", "G", "A")).toEqual({
      reference: "A",
      alternative: "G",
    });
  });

  it("complements transcript alleles on the negative strand", () => {
    expect(orientAllelesToGrch38("A", "G", "T")).toEqual({
      reference: "T",
      alternative: "C",
    });
  });

  it("rejects alleles that do not match GRCh38", () => {
    expect(() => orientAllelesToGrch38("A", "G", "C")).toThrow(/GRCh38/);
  });
});

describe("variant request contract", () => {
  it("accepts one GRCh38 SNV", () => {
    expect(
      variantRequestSchema.safeParse({
        variant_pos: 43_119_628,
        alt_allele: "G",
        expected_ref: "A",
        genome: "hg38",
        chromosome: "chr17",
      }).success,
    ).toBe(true);
  });

  it("rejects unsupported assemblies and contigs", () => {
    expect(
      variantRequestSchema.safeParse({
        variant_pos: 1,
        alt_allele: "A",
        genome: "hg19",
        chromosome: "chrUn",
      }).success,
    ).toBe(false);
  });
});
