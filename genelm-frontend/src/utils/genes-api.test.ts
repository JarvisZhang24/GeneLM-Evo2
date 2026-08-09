import { afterEach, describe, expect, it, vi } from "vitest";

import { getGenes } from "./genes-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NCBI gene search contract", () => {
  it("accepts trailing Clinical Tables metadata fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            1,
            ["BRCA1"],
            {
              chromosome: ["17"],
              Symbol: ["BRCA1"],
              description: ["BRCA1 DNA repair associated"],
              type_of_gene: ["protein-coding"],
              GeneID: ["672"],
            },
            [["BRCA1"]],
            { source: "NCBI Gene" },
          ]),
          { status: 200 },
        ),
      ),
    );

    await expect(getGenes("BRCA1")).resolves.toEqual([
      {
        gene_id: "672",
        symbol: "BRCA1",
        chromosome: "chr17",
        description: "BRCA1 DNA repair associated",
        type_of_gene: "protein-coding",
      },
    ]);
  });

  it("does not expose raw schema errors to the UI", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ unexpected: true }), { status: 200 }),
        ),
    );

    await expect(getGenes("BRCA1")).rejects.toThrow(
      "NCBI gene search returned an unexpected response",
    );
  });
});
