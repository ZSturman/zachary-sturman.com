"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { ProjectListItem } from "@/components/project-list-item"
import { ProjectModal } from "./project-model"

import type { Project } from "@/types"

interface ProjectGridProps {
  viewMode?: "grid" | "list"
  projects: Project[]
}

export function ProjectGrid({ viewMode = "list", projects }: ProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <ProjectCard key={project.id + idx} project={project} onClick={() => setSelectedProject(project)} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, idx) => (
            <ProjectListItem key={project.id + idx } project={project} onClick={() => setSelectedProject(project)} />
          ))}
        </div>
      )}

      <ProjectModal project={selectedProject} isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  )
}
