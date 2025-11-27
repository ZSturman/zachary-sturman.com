"use client"

import { ProjectCard } from "@/components/project-list/project-card"
import { ProjectListItem } from "@/components/project-list/project-list-item"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import type { Project } from "@/types"

interface ProjectListProps {
  viewMode?: "grid" | "list"
  projects: Project[]
}

export function ProjectList({ viewMode = "list", projects }: ProjectListProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleClick = (id: string) => {
    // On mobile, navigate directly to project details page
    // On desktop, use modal route
    if (isMobile) {
      router.push(`/projects/${id}`)
    } else {
      router.push(`/?project=${id}`, { scroll: false })
      router.prefetch(`/projects/${id}`)
    }
  }

  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-full overflow-x-hidden">
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id + idx}
              project={project}
              onClick={() => handleClick(project.id)}
              compact
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-full overflow-x-hidden">
          {projects.map((project, idx) => (
            <ProjectListItem
              key={project.id + idx}
              project={project}
              onClick={() => handleClick(project.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
