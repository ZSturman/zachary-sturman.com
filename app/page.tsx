
"use client"

import { useEffect, useState } from "react"
import { PortfolioHeader } from "@/components/portfolio-header"
import { PortfolioClient } from "@/components/portfolio-client"
import type { Project } from "@/types"

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PortfolioHeader />
        {loading ? <p className="text-muted-foreground">Loading projects…</p> : <PortfolioClient projects={projects} />}
      </div>
    </div>
  )
}
