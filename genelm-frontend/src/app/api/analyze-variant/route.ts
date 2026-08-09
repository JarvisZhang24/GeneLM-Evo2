import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import {
  analysisResultSchema,
  variantRequestSchema,
} from "~/utils/variant-schema";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const parsed = variantRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid GRCh38 single-nucleotide variant request", requestId },
      { status: 400 },
    );
  }

  const modalUrl = process.env.MODAL_ANALYZE_URL;
  const modalKey = process.env.MODAL_PROXY_KEY;
  const modalSecret = process.env.MODAL_PROXY_SECRET;
  if (!modalUrl || !modalKey || !modalSecret) {
    return NextResponse.json(
      { error: "Evo2 inference is not configured yet", requestId },
      { status: 503 },
    );
  }

  const { env } = getCloudflareContext();
  const actor = request.headers.get("cf-connecting-ip") ?? "local-development";
  const rateLimit = await env.ANALYSIS_RATE_LIMITER.limit({ key: actor });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Analysis rate limit exceeded; retry in one minute", requestId },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const response = await fetch(modalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": modalKey,
        "Modal-Secret": modalSecret,
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(180_000),
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error("modal_analysis_failed", {
        requestId,
        status: response.status,
      });
      return NextResponse.json(
        {
          error: "The inference service could not score this variant",
          requestId,
        },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }
    const result = analysisResultSchema.parse(payload);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Request-ID": requestId,
      },
    });
  } catch (error) {
    console.error("modal_analysis_exception", {
      requestId,
      message: error instanceof Error ? error.message : "unknown error",
    });
    return NextResponse.json(
      { error: "The inference service is temporarily unavailable", requestId },
      { status: 502 },
    );
  }
}
