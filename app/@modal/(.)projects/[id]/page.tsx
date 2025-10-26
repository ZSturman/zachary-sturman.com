"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProjectModal } from "@/components/project-modal"
import type { Project } from "@/types"

export default function InterceptedProjectModal() {
  const params = useParams() as { id?: string }
  const id = String(params?.id ?? "")
  const [project, setProject] = useState<Project | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/projects/projects.json')
        if (!res.ok) return
        const data = await res.json()
        const projects = data as unknown as Array<Record<string, unknown>>
        const found = projects.find((p) => String(p.id) === id) as unknown as Project | undefined
        if (mounted) setProject(found ?? null)
      } catch (e) {
        console.error(e)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])


  return (
    <ProjectModal
      project={project}
      isOpen={!!project}
      onClose={() => router.back()}
    />
  )
}
