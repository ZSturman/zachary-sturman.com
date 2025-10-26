"use client"

import Link from "next/link"
import { ProjectCard } from "@/components/project-list/project-card"
import { ProjectListItem } from "@/components/project-list/project-list-item"

import type { Project } from "@/types"

interface ProjectGridProps {
  viewMode?: "grid" | "list"
  projects: Project[]
}

export function ProjectGrid({ viewMode = "list", projects }: ProjectGridProps) {
  // Navigate to intercepting modal route when clicking — use the (modal) route group.
  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((project, idx) => (
              (<Link key={project.id + idx} href={`/projects/${project.id}`}>
                <ProjectCard project={project} onClick={() => {}} compact />
              </Link>)
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, idx) => (
              <Link key={project.id + idx} href={`/projects/${project.id}`}>
                <ProjectListItem project={project} onClick={() => {}} />
              </Link>
          ))}
        </div>
      )}
    </>
  );
}
