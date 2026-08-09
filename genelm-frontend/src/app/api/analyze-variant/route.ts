import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createInferenceJobToken,
  verifyInferenceJobToken,
} from "~/utils/inference-job";
import {
  analysisResultSchema,
  variantRequestSchema,
} from "~/utils/variant-schema";

const submittedJobSchema = z.object({
  call_id: z.string().regex(/^fc-[A-Za-z0-9]+$/),
  status: z.literal("pending"),
});

function inferenceConfig() {
  const modalUrl = process.env.MODAL_ANALYZE_URL;
  const modalKey = process.env.MODAL_PROXY_KEY;
  const modalSecret = process.env.MODAL_PROXY_SECRET;
  return modalUrl && modalKey && modalSecret
    ? { modalUrl, modalKey, modalSecret }
    : null;
}

async function callModal(
  config: NonNullable<ReturnType<typeof inferenceConfig>>,
  body: object,
  requestId: string,
) {
  return fetch(config.modalUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Modal-Key": config.modalKey,
      "Modal-Secret": config.modalSecret,
      "X-Request-ID": requestId,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
}

function unavailable(requestId: string) {
  return NextResponse.json(
    { error: "Evo2 inference is not configured yet", requestId },
    { status: 503 },
  );
}

function failed(requestId: string, message: string) {
  console.error("modal_analysis_exception", { requestId, message });
  return NextResponse.json(
    { error: "The inference service is temporarily unavailable", requestId },
    { status: 502 },
  );
}

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

  const config = inferenceConfig();
  if (!config) return unavailable(requestId);

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
    const response = await callModal(
      config,
      { variant: parsed.data },
      requestId,
    );
    const payload = await response.json();
    if (response.status !== 202) {
      console.error("modal_submission_failed", {
        requestId,
        status: response.status,
      });
      return NextResponse.json(
        { error: "The inference service could not start this job", requestId },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const job = submittedJobSchema.parse(payload);
    const jobToken = await createInferenceJobToken(
      job.call_id,
      config.modalSecret,
    );
    return NextResponse.json(
      { status: "pending", job_token: jobToken },
      {
        status: 202,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    return failed(
      requestId,
      error instanceof Error ? error.message : "unknown error",
    );
  }
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const config = inferenceConfig();
  if (!config) return unavailable(requestId);

  const token = new URL(request.url).searchParams.get("job") ?? "";
  const callId = await verifyInferenceJobToken(token, config.modalSecret);
  if (!callId) {
    return NextResponse.json(
      { error: "Invalid inference job token", requestId },
      { status: 400 },
    );
  }

  try {
    const response = await callModal(config, { call_id: callId }, requestId);
    if (response.status === 202) {
      return NextResponse.json(
        { status: "pending" },
        {
          status: 202,
          headers: { "Cache-Control": "private, no-store" },
        },
      );
    }

    const payload = await response.json();
    if (!response.ok) {
      console.error("modal_result_failed", {
        requestId,
        status: response.status,
      });
      return NextResponse.json(
        { error: "The inference service could not finish this job", requestId },
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
    return failed(
      requestId,
      error instanceof Error ? error.message : "unknown error",
    );
  }
}
