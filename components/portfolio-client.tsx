"use client"
import { useMemo, useState } from "react"
import { ProjectFilters } from "@/components/project-filters"
import { ProjectGrid } from "@/components/project-grid"
import type { Project } from "@/types"

interface PortfolioClientProps {
  projects: Project[]
}

export function PortfolioClient({ projects }: PortfolioClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  // active filters state
  const [filters, setFilters] = useState<{
    search: string
    medium: string[]
    status: string[]
    tags: string[]
  }>({ search: "", medium: ["all"], status: ["all"], tags: [] })

  const [sort, setSort] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest")

  const handleFilterChange = (next: { search: string; medium: string[]; status: string[]; tags: string[] }) => {
    setFilters(next)
  }

  const filteredProjects = useMemo(() => {
    const s = filters.search.trim().toLowerCase()
    return projects.filter((p) => {
      // search matches title or summary or tags
      if (s) {
        const inTitle = p.title.toLowerCase().includes(s)
        const inSummary = p.summary.toLowerCase().includes(s)
        const inTags = (p.tags || []).some((t) => t.toLowerCase().includes(s))
        if (!inTitle && !inSummary && !inTags) return false
      }

      // medium/domain filter: user selects domain ids (we'll use domain string)
      if (filters.medium && !(filters.medium.length === 0 || (filters.medium.length === 1 && filters.medium[0] === "all"))) {
        const projDomain = String(p.domain || "").toLowerCase()
        // pass if any selected medium matches project domain
        const matchesMedium = filters.medium.some((m) => projDomain === m.toLowerCase())
        if (!matchesMedium) return false
      }

      // status filter (multi-select): project status must match one of the selected, unless "all" selected
      if (filters.status && !(filters.status.length === 0 || (filters.status.length === 1 && filters.status[0] === "all"))) {
        const status = (p as unknown as { status?: string })?.status
        if (!status) return false
        if (!filters.status.some((s) => s === status)) return false
      }

      // tags filter: all selected tags must be present
      if (filters.tags && filters.tags.length > 0) {
        const projectTags = (p.tags || []).map((t) => t.toLowerCase())
        const required = filters.tags.map((t) => t.toLowerCase())
        if (!required.every((t) => projectTags.includes(t))) return false
      }

      return true
    })
  }, [projects, filters])

  const sortedProjects = useMemo(() => {
    const copy = [...filteredProjects]
    switch (sort) {
      case "newest":
        return copy.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      case "oldest":
        return copy.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
      case "title-asc":
        return copy.sort((a, b) => a.title.localeCompare(b.title))
      case "title-desc":
        return copy.sort((a, b) => b.title.localeCompare(a.title))
      default:
        return copy
    }
  }, [filteredProjects, sort])

  return (
    <>
      <ProjectFilters
        projects={projects}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSortChange={(s) => setSort(s)}
        sort={sort}
        totalCount={projects.length}
        visibleCount={filteredProjects.length}
      />
      <ProjectGrid viewMode={viewMode} projects={sortedProjects} />
    </>
  )
}
