import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const config: NextConfig = {
  agentRules: false,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
