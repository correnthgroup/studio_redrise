import type { NextConfig } from "next"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  turbopack: {
    root: projectRoot,
  },
  // cacheComponents is intentionally not enabled; use standard App Router revalidation for now.
}

export default nextConfig
