import { describe, expect, it } from "vitest";

import {
  createInferenceJobToken,
  verifyInferenceJobToken,
} from "./inference-job";

describe("inference job tokens", () => {
  it("round-trips an authenticated Modal call ID", async () => {
    const token = await createInferenceJobToken("fc-01ABC", "test-secret");

    await expect(verifyInferenceJobToken(token, "test-secret")).resolves.toBe(
      "fc-01ABC",
    );
  });

  it("rejects tampered or malformed tokens", async () => {
    const token = await createInferenceJobToken("fc-01ABC", "test-secret");

    await expect(
      verifyInferenceJobToken(`${token}x`, "test-secret"),
    ).resolves.toBeNull();
    await expect(
      verifyInferenceJobToken("not-a-token", "test-secret"),
    ).resolves.toBeNull();
  });
});
