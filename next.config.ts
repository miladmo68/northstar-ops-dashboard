import type { NextConfig } from "next";

const repositoryName = "northstar-ops-dashboard";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : "",
  images: { unoptimized: true },
};

export default nextConfig;
