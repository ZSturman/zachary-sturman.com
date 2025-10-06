"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, Grid3X3, List } from "lucide-react"
import type { Project } from "@/types"
// We'll derive domains and statuses from the incoming `projects` prop

interface ProjectFiltersProps {
  projects?: Project[]
  onFilterChange?: (filters: {
    search: string
    medium: string[]
    status: string[]
    tags: string[]
  }) => void
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
  onSortChange?: (s: "newest" | "oldest" | "title-asc" | "title-desc") => void
  sort?: "newest" | "oldest" | "title-asc" | "title-desc"
  totalCount?: number
  visibleCount?: number
}

export function ProjectFilters({ projects = [], onFilterChange, viewMode = "grid", onViewModeChange, onSortChange, sort = "newest", totalCount, visibleCount }: ProjectFiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedMedium, setSelectedMedium] = useState<string[]>(["all"])
  const [selectedStatus, setSelectedStatus] = useState<string[]>(["all"])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // derive domains and statuses from provided projects prop if present
  const domains = useMemo(() => {
    const set = new Set<string>()
    set.add("all")
    projects.forEach((p) => {
      if (p?.domain) set.add(String(p.domain))
    })
    return Array.from(set)
  }, [projects])

  const statuses = useMemo(() => {
    const set = new Set<string>()
    set.add("all")
    projects.forEach((p) => {
      const s = (p as unknown as { status?: string })?.status
      if (s) set.add(String(s))
    })
    return Array.from(set)
  }, [projects])

  // human-friendly labels for common status keys
  const friendlyStatusLabel = (s: string) => {
    const map: Record<string, string> = {
      idea: "Idea",
      draft: "Draft",
      prototype: "Prototype",
      alpha: "Alpha",
      beta: "Beta",
      early_access: "Early Access",
      released_stable: "Released (Stable)",
      maintenance: "Maintenance",
      deprecated: "Deprecated",
      end_of_life: "End of Life",
      editing: "Editing",
      in_review: "In Review",
      released_preview: "Released (Preview)",
      published_provisional: "Published (Provisional)",
      released: "Released",
      definitive_edition: "Definitive Edition",
      submitted: "Submitted",
      preprint: "Preprint",
      under_review: "Under Review",
      final_published: "Final Published",
      living_document: "Living Document",
      finished: "Finished",
      archived: "Archived",
    }
    if (map[s]) return map[s]
    // fallback: prettify snake_case or kebab-case
    return s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const handleFilterChange = () => {
    onFilterChange?.({
      search,
      medium: selectedMedium,
      status: selectedStatus,
      tags: selectedTags,
    })
  }

  // ensure filters are propagated when any individual filter changes
  useEffect(() => {
    handleFilterChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedMedium, selectedStatus, selectedTags])

  const clearFilters = () => {
    setSearch("")
    setSelectedMedium(["all"])
    setSelectedStatus(["all"])
    setSelectedTags([])
    onFilterChange?.({
      search: "",
      medium: ["all"],
      status: ["all"],
      tags: [],
    })
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {typeof visibleCount === "number" ? visibleCount : "?"} of {typeof totalCount === "number" ? totalCount : "?"}
        </div>
        <div>
          <label className="text-sm text-muted-foreground mr-2">Sort</label>
          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value as "newest" | "oldest" | "title-asc" | "title-desc")}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title-asc">Title A → Z</option>
            <option value="title-desc">Title Z → A</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search projects"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange?.("grid")}
            className="h-8 w-8 p-0"
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange?.("list")}
            className="h-8 w-8 p-0"
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Medium Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Medium</h3>
        <div className="flex flex-wrap gap-2">
          {domains.map((d) => {
            const active = selectedMedium.includes(d)
            return (
              <Button
                key={d}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  // toggle selection; if selecting "all", reset to ["all"]
                  if (d === "all") return setSelectedMedium(["all"])
                  setSelectedMedium((prev) => {
                    const withoutAll = prev.filter((x) => x !== "all")
                    if (prev.includes(d)) return withoutAll.length === 0 ? ["all"] : withoutAll.filter((x) => x !== d)
                    return [...withoutAll, d]
                  })
                }}
                className="gap-2"
                aria-pressed={active}
              >
                {d === "all" ? "All Projects" : d}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Status</h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => {
            const active = selectedStatus.includes(s)
            return (
              <Button
                key={s}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (s === "all") return setSelectedStatus(["all"])
                  setSelectedStatus((prev) => {
                    const withoutAll = prev.filter((x) => x !== "all")
                    if (prev.includes(s)) return withoutAll.length === 0 ? ["all"] : withoutAll.filter((x) => x !== s)
                    return [...withoutAll, s]
                  })
                }}
                aria-pressed={active}
              >
                {s === "all" ? "All Status" : (friendlyStatusLabel(s) || s)}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Active Filters & Clear */}
      {(search || (selectedMedium.length > 0 && !(selectedMedium.length === 1 && selectedMedium[0] === "all")) || (selectedStatus.length > 0 && !(selectedStatus.length === 1 && selectedStatus[0] === "all")) || selectedTags.length > 0) && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: {search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
            </Badge>
          )}
          {selectedMedium.length > 0 && !(selectedMedium.length === 1 && selectedMedium[0] === "all") && (
            selectedMedium.map((m) => (
              <Badge key={m} variant="secondary" className="gap-1">
                {m}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedMedium((prev) => (prev.filter((x) => x !== m).length === 0 ? ["all"] : prev.filter((x) => x !== m)))} />
              </Badge>
            ))
          )}
          {selectedStatus.length > 0 && !(selectedStatus.length === 1 && selectedStatus[0] === "all") && (
            selectedStatus.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1">
                {friendlyStatusLabel(s) || s}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatus((prev) => (prev.filter((x) => x !== s).length === 0 ? ["all"] : prev.filter((x) => x !== s)))} />
              </Badge>
            ))
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
