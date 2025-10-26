import type { NextConfig } from "next";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Read external image hostnames from the pre-build script output
let remotePatterns: { protocol: "https"; hostname: string }[] = [];

try {
  const hostnamesPath = join(process.cwd(), "public", "image-hostnames.json");
  
  if (existsSync(hostnamesPath)) {
    const hostnamesData = JSON.parse(readFileSync(hostnamesPath, "utf-8"));
    const hostnames = hostnamesData.hostnames || [];
    
    remotePatterns = hostnames.map((hostname: string) => ({
      protocol: "https" as const,
      hostname,
    }));
    
    console.log(`✓ Loaded ${remotePatterns.length} external image hostname(s) for Next.js Image optimization`);
  } else {
    console.warn("⚠ image-hostnames.json not found. Run the pre-build script first if you have external images.");
  }
} catch (error) {
  console.error("Error loading image hostnames config:", error);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
