
import { loadPublicJsonRecursively } from "@/lib/load-public-json";
import { PortfolioHeader } from "@/components/portfolio-header"
import { PortfolioClient } from "@/components/portfolio-client"
import type { Project } from "@/types";

export const dynamic = "force-static";

export default async function PortfolioPage() {
  const projects = await loadPublicJsonRecursively<Project>("projects");
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PortfolioHeader />
        <PortfolioClient projects={projects} />
      </div>
    </div>
  )
}
