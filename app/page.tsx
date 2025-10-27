
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PortfolioHeader } from "@/components/portfolio-header"
import { PortfolioClient } from "@/components/portfolio-client"
import { ProjectModal } from "@/components/project-modal"
import type { Project } from "@/types"

function PortfolioContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/projects/projects.json')
        if (!res.ok) throw new Error('Failed to fetch projects')
        const data = (await res.json()) as Project[]
        if (mounted) setProjects(data)
      } catch (err) {
        console.error('Error loading projects', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Find the project for the modal
  const modalProject = projectId ? projects.find(p => p.id === projectId) || null : null

  const handleCloseModal = () => {
    // Remove the project parameter from the URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('project')
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.replace(newUrl, { scroll: false })
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PortfolioHeader />
        {loading ? <p className="text-muted-foreground">Loading projects…</p> : <PortfolioClient projects={projects} />}
      </div>
      {!loading && <ProjectModal project={modalProject} isOpen={!!projectId && !!modalProject} onClose={handleCloseModal} />}
    </>
  )
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <PortfolioHeader />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }>
        <PortfolioContent />
      </Suspense>
    </div>
  )
}
