"use client"
import Image from "next/image";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Project } from "@/types"
import { STATUS_COLOR, bestIconPath } from "@/lib/resource-map"


interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}


export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!project) return null
  
  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // Helper to format ISO date string to human-readable
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-balance">{project.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`${STATUS_COLOR[project.status as keyof typeof STATUS_COLOR]} font-medium`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                <Badge variant="outline">{project.domain.charAt(0).toUpperCase() + project.domain.slice(1)}</Badge>

              </div>

            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={project.thumbnail || "/placeholder.svg"}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover"
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">About This Project</h3>
            <p className="text-muted-foreground leading-relaxed text-pretty">{project.summary}</p>
          </div>

          {/* Tags (only if present) */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resources (only if present) */}
          {project.resources && project.resources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.resources.map((resource) => {
                  const src = bestIconPath(resource.type, project.domain)
                  return (
                    <Button
                      key={resource.type}
                      variant="outline"
                      className="justify-start gap-3 h-auto p-4 bg-transparent"
                      onClick={(e) => handleLinkClick(e, resource.url)}
                    >
                      <Image
                        className="dark:invert shrink-0"
                        src={src}
                        alt={resource.type}
                        width={20}
                        height={20}
                      />
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
          )}
        </div>

      <DialogFooter>
        <div className="w-full flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
          <div className="text-sm text-muted-foreground">
            <div>Created: {formatDate(project.createdAt)}</div>
            <div>Last Updated: {formatDate(project.updatedAt)}</div>
          </div>
        </div>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
