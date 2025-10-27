import Link from "next/link"
import type { Project } from "@/types"
import { loadPublicJsonRecursively } from "@/lib/load-public-json"
import ProjectDetailsClientWrapper from "@/components/project-details-client-wrapper"


export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  try {
    const projects = await loadPublicJsonRecursively<Project>("projects")
    return projects.map((p) => ({ id: p.id }))
  } catch (e) {
    console.error("generateStaticParams: failed to load projects:", e)
    return []
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const projects = await loadPublicJsonRecursively<Project>("projects")
    const project = projects.find((p) => p.id === id) as Project | undefined

    if (!project) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                ← Home
              </Link>
            </div>
            <div className="text-center text-muted-foreground">Project not found.</div>
          </div>
        </div>
      )
    }
    return (
          <ProjectDetailsClientWrapper project={project} />
    )
  } catch (e) {
    console.error(e)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              ← Home
            </Link>
          </div>
          <div className="text-center text-muted-foreground">Error loading project.</div>
        </div>
      </div>
    )
  }
}
