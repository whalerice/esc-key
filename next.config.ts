import type { NextConfig } from 'next';

/** Spec: docs/공통엔진.md §16 — static export for HTTPS hosting. */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
