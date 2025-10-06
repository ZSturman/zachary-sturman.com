"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { STATUS_COLOR } from "@/lib/resource-map"
import type { Project } from "@/types"

import { Code, BookOpen, ExternalLink, Github, PenTool, Cpu } from "lucide-react"
import Image from "next/image"

// Map domain to icon
const domainIcons = {
  Technology: Cpu,
  Creative: PenTool,
  Expository: BookOpen,
}



export interface ProjectListItemProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectListItem({ project, onClick }: ProjectListItemProps) {
  // Pick icon based on domain
  const DomainIcon = domainIcons[project.domain as keyof typeof domainIcons] || Code;
  const primaryLink = Array.isArray(project.resources) && project.resources.length > 0 ? project.resources[0] : undefined;
  const projectWithMediums = project as Project & { mediums?: string[] }
  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={onClick}>
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted aspect-square">
            {/* Avoid creating "/projects/<id>/undefined" when thumbnail is missing */}
            {(() => {
              const thumbSrc = project.images?.thumbnail
                ? `/projects/${project.id}/${project.images.thumbnail}`
                : "/placeholder.svg";
              return (
                <Image
                  src={thumbSrc}
                  alt={`${project.title} thumbnail`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              )
            })()}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>
              <div className="flex items-center gap-2">
                <DomainIcon className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className={STATUS_COLOR[project.status] || "bg-gray-100"}>
                    {project.substatus ?? project.status}
                  </Badge>
                  {projectWithMediums.mediums && projectWithMediums.mediums.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {projectWithMediums.mediums[0]}
                    </Badge>
                  )}
              </div>
            </div>
            {/* Optionally display year if present in metadata */}
            {typeof project.metadata?.year === "string" && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">{project.metadata.year}</span>
            )}
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.summary}</p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {(project.tags || []).slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags && project.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.tags.length - 4}
                </Badge>
              )}
            </div>

            {primaryLink && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(primaryLink.url, "_blank")
                }}
              >
                {primaryLink.type === "github" ? <Github className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                {primaryLink.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
