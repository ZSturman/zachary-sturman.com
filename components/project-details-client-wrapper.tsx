"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ProjectDetails from "@/components/projects-details"
import type { Project } from "@/types"

interface ProjectDetailsClientWrapperProps {
  project: Project
}

function ProjectDetailsContent({ project }: ProjectDetailsClientWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // If the URL contains the 'project' parameter (from modal navigation),
    // remove it to prevent modal from showing on refresh/direct access
    const hasProjectParam = searchParams.has('project')
    if (hasProjectParam) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('project')
      const newUrl = `/projects/${project.id}${params.toString() ? `?${params.toString()}` : ''}`
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, project.id])

  return <ProjectDetails project={project} />
}

export default function ProjectDetailsClientWrapper({ project }: ProjectDetailsClientWrapperProps) {
  return (
    <Suspense fallback={<ProjectDetails project={project} />}>
      <ProjectDetailsContent project={project} />
    </Suspense>
  )
}
