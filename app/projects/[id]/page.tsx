import Link from "next/link"
import { ProjectDetail } from "@/components/project-detail"
import type { Project } from "@/types"
import { loadPublicJsonRecursively } from "@/lib/load-public-json"

// Ensure the route can be statically generated (useful for static hosts like
// Firebase Hosting). generateStaticParams will be used by Next to pre-render
// all project pages at build time.
export async function generateStaticParams() {
  try {
    const projects = await loadPublicJsonRecursively<Project>("projects")
    return projects.map((p) => ({ id: p.id }))
  } catch (e) {
    console.error("generateStaticParams: failed to load projects:", e)
    return []
  }
}

export default async function ProjectPage(props: unknown) {
  // Some server contexts pass `props` as a Thenable; await it before using
  // `params` to avoid Next.js sync-dynamic-apis runtime warning.
  const resolved = await Promise.resolve(props as unknown)
  const params = (resolved as { params?: { id?: string } })?.params
  const id = String(params?.id ?? "")

  try {
    // Load projects from the local public directory at build/server time.
    // This avoids runtime external fetches, making the site compatible with
    // static hosting (Firebase Hosting) when pages are pre-rendered.
    const projects = await loadPublicJsonRecursively<Project>("projects")
  const found = projects.find((p) => p.id === id)

    if (!found) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
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

    const project = found as unknown as Project

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              ← Home
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          {/* ProjectDetail is a client component and will hydrate on the client. */}
          <ProjectDetail project={project} />
        </div>
      </div>
    )
  } catch (e) {
    console.error(e)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
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
