"use client"
import Image from "next/image";
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Project } from "@/types"
import { bestIconPath } from "@/lib/resource-map"

interface ProjectDetailProps {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  if (!project) return null

  const projectWithMediums = project as Project & { mediums?: string[] }

  // Narrower type guard for collection-like projects
  const isCollection = (p: Project): p is Project & { type?: string; collection?: { items?: unknown[] } } => {
    const maybe = p as unknown as Record<string, unknown>
    return typeof maybe.type === "string" && maybe.type === "collection" && typeof maybe.collection === "object" && maybe.collection !== null
  }

  const srcLandscape = project.images && typeof project.images.posterLandscape === "string" && project.images.posterLandscape
    ? `/projects/${project.id}/${project.images.posterLandscape}`
    : null
  const srcThumb = project.images && typeof project.images.thumbnail === "string" && project.images.thumbnail
    ? `/projects/${project.id}/${project.images.thumbnail}`
    : "/placeholder.svg"

  const heroSrc = srcLandscape ?? srcThumb
  const aspectClass = srcLandscape ? "aspect-[16/9]" : "aspect-square"

  const collectionItems = isCollection(project) && Array.isArray(project.collection?.items)
    ? (project.collection!.items as Array<Record<string, unknown>>)
    : []

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"

  return (
    <div className="space-y-6">
      <div className={`relative ${aspectClass} overflow-hidden rounded-lg bg-muted`}>
        <Image
          src={heroSrc}
          alt={`${project.title} image`}
          fill
          className="object-contain"
          sizes="(min-width: 768px) 960px, 100vw"
        />
      </div>

      {isCollection(project) && collectionItems.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Collection Showcase</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              {/* Show first item as main */}
              {(() => {
                const main = collectionItems[0]
                const mainSrc = typeof main?.thumbnail === "string" && main.thumbnail ? `/projects/${project.id}/${main.thumbnail}` : (typeof main?.image === "string" && main.image ? `/projects/${project.id}/${main.image}` : "/placeholder.svg")
                const mainAlt = typeof main?.label === "string" ? main.label : typeof main?.id === "string" ? main.id : project.title
                return (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                    <Image src={mainSrc} alt={mainAlt} fill className="object-contain" />
                  </div>
                )
              })()}
            </div>
            <div className="md:col-span-1">
              <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
                {collectionItems.map((it, i) => {
                  const label = typeof it.label === "string" ? it.label : (typeof it.id === "string" ? it.id : `Item ${i + 1}`)
                  const thumb = typeof it.thumbnail === "string" && it.thumbnail ? `/projects/${project.id}/${it.thumbnail}` : "/placeholder.svg"
                  const key = (typeof it.id === "string" ? it.id : String(i))
                  return (
                    <div key={key + i} className={`relative w-full pb-[100%] rounded overflow-hidden bg-muted`}>
                      <Image src={thumb} alt={label} fill className="object-cover" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed text-pretty">{project.summary}</p>
      </div>

      {projectWithMediums.mediums?.length ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {projectWithMediums.mediums.map((m) => (
              <Badge key={m} variant="outline">{m}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      {project.tags?.length ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      {project.resources?.length ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.resources.map((resource) => {
              const icon = bestIconPath(resource.type, project.domain)
              return (
                <Button
                  key={resource.type + resource.url}
                  variant="outline"
                  className="justify-start gap-3 h-auto p-4 bg-transparent"
                  onClick={(e) => handleLinkClick(e, resource.url)}
                >
                  <Image className="dark:invert shrink-0" src={icon} alt={resource.type} width={20} height={20} />
                  <div className="text-left">
                    <div className="font-medium">{resource.label}</div>
                    <div className="text-xs text-muted-foreground capitalize">{resource.type}</div>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                </Button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-pretty">
            {project.status === "idea" && <>This is something that&apos;s coming in the future. Email zasturman@gmail.com for details.</>}
            {project.status === "in_progress" && <>This is currently a work in progress. Email zasturman@gmail.com for details.</>}
            {project.status !== "idea" && project.status !== "in_progress" && <>No external resources are published. Email zasturman@gmail.com to learn more.</>}
          </p>
        </div>
      )}

      <div className="w-full flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
        <div className="text-sm text-muted-foreground">
          <div>Created: {formatDate(project.createdAt)}</div>
          <div>Last Updated: {formatDate(project.updatedAt)}</div>
        </div>
      </div>
    </div>
  )
}
