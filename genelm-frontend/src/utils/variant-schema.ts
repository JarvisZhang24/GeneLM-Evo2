import { z } from "zod";

const dnaBaseSchema = z.enum(["A", "C", "G", "T"]);
const chromosomeSchema = z.string().regex(/^chr(?:[1-9]|1\d|2[0-2]|X|Y|M)$/);

export const variantRequestSchema = z.object({
  variant_pos: z.number().int().positive(),
  alt_allele: dnaBaseSchema,
  expected_ref: dnaBaseSchema.optional(),
  genome: z.literal("hg38"),
  chromosome: chromosomeSchema,
});

export const analysisResultSchema = z.object({
  position: z.number().int().positive(),
  chromosome: chromosomeSchema,
  genome: z.literal("hg38"),
  model: z.string(),
  context_length: z.number().int().positive(),
  reference: dnaBaseSchema,
  alternate: dnaBaseSchema,
  reference_score: z.number(),
  alternate_score: z.number(),
  delta_likelihood: z.number(),
  interpretation: z.string(),
});

export type VariantRequest = z.infer<typeof variantRequestSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
