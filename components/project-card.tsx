"use client"

import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Image from "next/image"
import { Project } from "@/types"
import { bestIconPath, STATUS_COLOR } from "@/lib/resource-map"

interface ProjectCardProps {
  project: Project
  onClick?: () => void
  compact?: boolean
}

export function ProjectCard({ project, onClick, compact = false }: ProjectCardProps) {
  const techWithMediums = project as Project & { mediums?: string[] }

  const posterPortrait = project.images?.posterPortrait
    ? `/projects/${project.id}/${project.images.posterPortrait}`
    : null

  const posterLandscape = project.images?.posterLandscape
    ? `/projects/${project.id}/${project.images.posterLandscape}`
    : null

  const thumb = project.images && typeof project.images.thumbnail === "string" && project.images.thumbnail
    ? `/projects/${project.id}/${project.images.thumbnail}`
    : "/placeholder.svg"

  // Prefer portrait if provided for portrait projects, else landscape, else thumb.
  const mainSrc = posterPortrait ?? posterLandscape ?? thumb
  const isPortrait = Boolean(posterPortrait && !posterLandscape)
  const aspectClass = isPortrait ? "aspect-[9/16]" : "aspect-[16/9]" // posters are fixed, just transposed

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, "_blank", "noopener,noreferrer")
  }


  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"


  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-card border-border"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        {compact ? (
          <div className="relative overflow-hidden rounded-t-lg">
            <div className="relative aspect-square">
              <Image src={thumb} alt={`${project.title} thumbnail`} fill className="object-cover" />
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-t-lg">

            {/* Main poster: fixed aspect so it never crops */}
            <div className={`relative w-full ${aspectClass}`}>
              <Image
                src={mainSrc}
                alt={`${project.title} poster`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 800px, 100vw"
                priority={false}
              />

              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className={`${STATUS_COLOR[project.status as keyof typeof STATUS_COLOR]} font-medium`}
                >
                  {(project.status || "").charAt(0).toUpperCase() + (project.status || "").slice(1)}
                </Badge>
              </div>

              <div className="absolute top-3 right-3">
                {Array.isArray(techWithMediums.mediums) && techWithMediums.mediums.length > 0 ? (
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                    {techWithMediums.mediums[0]}
                    {techWithMediums.mediums.length > 1 ? ` +${techWithMediums.mediums.length - 1}` : ""}
                  </Badge>
                ) : null}
              </div>

              <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
        )}
      </CardHeader>

  <CardContent className="p-4 space-y-3 relative pb-10">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-card-foreground leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h3>

          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{project.summary}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {project.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags && project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">+{project.tags.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          {Array.isArray(project.resources) && project.resources.length > 0 ? (
            <div className="flex items-center gap-2">
              {project.resources.slice(0, 4).map((resource) => {
                const src = bestIconPath(resource.type, project.domain)
                return (
                  <Button
                    key={resource.type + resource.url}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={(e) => handleLinkClick(e, resource.url)}
                    aria-label={resource.label || resource.type}
                    title={resource.label || resource.type}
                  >
                    <Image className="dark:invert" src={src} alt={resource.type} width={18} height={18} />
                  </Button>
                )
              })}

              {project.resources.length > 4 && (
                <div className="ml-1">
                  <Badge variant="secondary" className="text-xs">+{project.resources.length - 4}</Badge>
                </div>
              )}
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={onClick}>
              <Eye className="h-3 w-3" />
              Details
            </Button>
          )}

          {Array.isArray(project.resources) && project.resources.length > 4 && (
            <Button variant="ghost" size="sm" className="gap-2 text-xs ml-auto" onClick={onClick}>
              <Eye className="h-3 w-3" />
              View More
            </Button>
          )}

          <div className="absolute bottom-3 right-3 text-sm text-muted-foreground ">
            <div >Last Updated: {formatDate(project.updatedAt)}</div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}