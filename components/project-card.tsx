"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye } from "lucide-react"
import Image from "next/image"
import { Project } from "@/types"
import { bestIconPath, STATUS_COLOR } from "@/lib/resource-map"

interface ProjectCardProps {
  project: Project
  onClick: () => void
}


export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, "_blank", "noopener,noreferrer")
  }


  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-card border-border"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image
            src={project.thumbnail || "/placeholder.svg"}
            alt={`${project.title} thumbnail`}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className={`${STATUS_COLOR[project.status as keyof typeof STATUS_COLOR]} font-medium`}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
{/*             <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {project.medium.charAt(0).toUpperCase() + project.medium.slice(1)}
            </Badge> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-card-foreground text-balance leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <span className="text-xs text-muted-foreground shrink-0">{project.updatedAt}</span>
          </div>
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-2">{project.summary}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {project.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags && project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.resources.slice(0, 2).map((resource) => {
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
          {project.resources.length > 2 && (
            <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={onClick}>
              <Eye className="h-3 w-3" />
              View More
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
