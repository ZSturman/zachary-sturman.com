"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Project } from "@/types"
import { Search, ChevronDown, Grid3X3, List, SlidersHorizontal, ChevronUp } from "lucide-react"
import { friendlyStatusLabel } from "@/lib/resource-map"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type SearchScope = "all" | "tags" | "title"
type SortField = "title" | "createdAt" | "updatedAt"
type SortOrder = "asc" | "desc"

interface ProjectFiltersProps {
  projects?: Project[];
  onFilterChange?: (filters: {
    search: string;
    // domain = Technology / Creative / Expository
    domain: string[];
    // medium = e.g. Mobile, Desktop, CLI, Novel, etc.
    medium: string[];
    status: string[];
    tags: string[];
    // which scope to search within: any/title/tags
    searchScope?: "all" | "title" | "tags";
  }) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  onSortChange?: (s: "newest" | "oldest" | "title-asc" | "title-desc") => void;
  sort?: "newest" | "oldest" | "title-asc" | "title-desc";
  // optional counts for callers to pass for display; component derives its own counts if not used
  totalCount?: number;
  visibleCount?: number;
  // totalCount and visibleCount intentionally omitted — derived from `projects` and filters
  // show starred-only initial view vs all public
  showAll?: boolean;
  onShowAllToggle?: (v: boolean) => void;
  // initial / controlled seeds (used to initialize internal UI state)
  initialSearch?: string;
  initialMedium?: string[];
  initialStatus?: string[];
  initialTags?: string[];
  initialSearchScope?: "all" | "title" | "tags";
}

export function ProjectFilters({
  projects = [],
  onFilterChange,
  viewMode = "grid",
  onViewModeChange,
  onSortChange,
  sort = "newest",
  showAll = false,
  onShowAllToggle,
  initialSearch = "",
  initialMedium = ["all"],
  initialStatus = ["all"],
  initialTags = [],
  initialSearchScope = "all",
}: ProjectFiltersProps) {
  // ui state
  const [isExpanded, setIsExpanded] = useState(false)
  // viewMode is driven by prop via onViewModeChange
  const [searchScope, setSearchScope] = useState<SearchScope>(
    initialSearchScope
  )
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch)
  const [sortField, setSortField] = useState<SortField>(
    sort === "title-asc" || sort === "title-desc" ? "title" : "updatedAt"
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    sort === "title-asc" || sort === "oldest" || sort === "title-desc"
      ? sort === "title-asc" || sort === "oldest"
        ? "asc"
        : "desc"
      : "desc"
  )

  // Multi-select filter states (kept names similar to original new-filters)
  const [selectedDomains, setSelectedDomains] = useState<string[]>(initialMedium)
  const [selectedMediums, setSelectedMediums] = useState<string[]>(["all"])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatus)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)

  // from project-filters: control refs/menus (kept for parity)
  const [, setOpenMenu] = useState<null | "show" | "domain" | "medium" | "status" | "tags">(null)
  const showRef = useRef<HTMLDivElement | null>(null)
  const domainRef = useRef<HTMLDivElement | null>(null)
  const mediumRef = useRef<HTMLDivElement | null>(null)
  const statusRef = useRef<HTMLDivElement | null>(null)

  // derive domains and statuses from provided projects prop if present
  const domains = useMemo(() => {
    const set = new Set<string>()
    set.add("all")
    projects.forEach((p) => {
      if (p?.domain) set.add(String(p.domain))
    })
    return Array.from(set)
  }, [projects])

  // derive explicit mediums from projects where available
  const mediums = useMemo(() => {
    const set = new Set<string>()
    set.add("all")
    projects.forEach((p) => {
      const maybeMediums = (p as unknown as { mediums?: unknown }).mediums
      if (Array.isArray(maybeMediums)) (maybeMediums as string[]).forEach((m) => m && set.add(String(m)))
      const maybeScript = (p as unknown as { scriptMediums?: unknown }).scriptMediums
      if (Array.isArray(maybeScript)) (maybeScript as string[]).forEach((m) => m && set.add(String(m)))
      const maybeGame = (p as unknown as { gameMediums?: unknown }).gameMediums
      if (Array.isArray(maybeGame)) (maybeGame as string[]).forEach((m) => m && set.add(String(m)))
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

  const totalProjects = projects.length

  // compute filtered projects count using current UI filters
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return projects.filter((p) => {
      // featured/starred filter - when showAll is false show only starred/featured
      if (!showAll && !p.featured) return false

      // domain filter
      if (selectedDomains.length > 0 && !(selectedDomains.length === 1 && selectedDomains[0] === "all")) {
        if (!selectedDomains.includes(String(p.domain))) return false
      }

      // medium filter
      if (selectedMediums.length > 0 && !(selectedMediums.length === 1 && selectedMediums[0] === "all")) {
        const projectMediums = [
          ...(p.mediums || []),
          ...( (p as unknown as { scriptMediums?: string[] }).scriptMediums || [] ),
          ...( (p as unknown as { gameMediums?: string[] }).gameMediums || [] ),
        ].map(String)
        const matchesMedium = selectedMediums.some((m) => projectMediums.includes(m))
        if (!matchesMedium) return false
      }

      // status filter
      if (selectedStatuses.length > 0 && !(selectedStatuses.length === 1 && selectedStatuses[0] === "all")) {
        if (!selectedStatuses.includes(String(p.status))) return false
      }

      // searchScope
      if (q) {
        const inTitle = p.title?.toLowerCase().includes(q)
        const inTags = Array.isArray(p.tags) && p.tags.join(" ").toLowerCase().includes(q)
        const inAll = inTitle || inTags || String(p.summary || "").toLowerCase().includes(q)
        if (searchScope === "all" && !inAll) return false
        if (searchScope === "title" && !inTitle) return false
        if (searchScope === "tags" && !inTags) return false
      }

      return true
    }).length
  }, [projects, showAll, selectedDomains, selectedMediums, selectedStatuses, searchQuery, searchScope])

  // close menus on outside click / Escape (kept from project-filters for parity)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      const containers = [showRef.current, domainRef.current, mediumRef.current, statusRef.current]
      if (!containers.some((c) => c && c.contains(target))) setOpenMenu(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  // propagate filter changes like project-filters did
  useEffect(() => {
    
    onFilterChange?.({
      search: searchQuery,
      domain: selectedDomains,
      medium: selectedMediums,
      status: selectedStatuses,
      tags: selectedTags,
      searchScope: searchScope,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchScope, selectedDomains, selectedMediums, selectedStatuses, selectedTags])

  // notify sort changes back to caller in the upstream format expected by project-filters
  useEffect(() => {
    if (!onSortChange) return
    let mapped: "newest" | "oldest" | "title-asc" | "title-desc" = "newest"
    if (sortField === "title") mapped = sortOrder === "asc" ? "title-asc" : "title-desc"
    else mapped = sortOrder === "asc" ? "oldest" : "newest"
    onSortChange(mapped)
  }, [sortField, sortOrder, onSortChange])

  // Intentionally do not auto-expand filters on load — keep collapsed by default.

  const toggleDomain = (domain: string) => {
    if (domain === "all") return setSelectedDomains(["all"])
    setSelectedDomains((prev) => {
      const withoutAll = prev.filter((x) => x !== "all")
      if (prev.includes(domain)) {
        const next = withoutAll.filter((x) => x !== domain)
        return next.length === 0 ? ["all"] : next
      }
      return [...withoutAll, domain]
    })
  }

  const toggleMedium = (medium: string) => {
    if (medium === "all") return setSelectedMediums(["all"])
    setSelectedMediums((prev) => {
      const withoutAll = prev.filter((x) => x !== "all")
      if (prev.includes(medium)) {
        const next = withoutAll.filter((x) => x !== medium)
        return next.length === 0 ? ["all"] : next
      }
      return [...withoutAll, medium]
    })
  }

  const toggleStatus = (status: string) => {
    if (status === "all") return setSelectedStatuses(["all"])
    setSelectedStatuses((prev) => {
      const withoutAll = prev.filter((x) => x !== "all")
      if (prev.includes(status)) {
        const next = withoutAll.filter((x) => x !== status)
        return next.length === 0 ? ["all"] : next
      }
      return [...withoutAll, status]
    })
  }

  const clearAllFilters = () => {
    setSelectedDomains(["all"])
    setSelectedMediums(["all"])
    setSelectedStatuses(["all"])
    setSelectedTags([])
    setSearchQuery("")
    // suggest returning to showing all projects when clearing
    onShowAllToggle?.(true)
  }

  const activeFilterCount =
    (selectedDomains.includes("all") ? 0 : selectedDomains.length) +
    (selectedMediums.includes("all") ? 0 : selectedMediums.length) +
    (selectedStatuses.includes("all") ? 0 : selectedStatuses.length) +
    selectedTags.length +
    (searchQuery.trim() ? 1 : 0)

  return (
    <div className="space-y-4 mb-2">
      {/* Top bar - always visible */}
      <div className="flex items-center justify-between gap-2 md:gap-4 flex-wrap max-w-full">


      
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="gap-1 md:gap-2 text-xs md:text-sm min-h-[44px]">
            <SlidersHorizontal className="h-3 w-3 md:h-4 md:w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 md:ml-1 h-4 md:h-5 min-w-4 md:min-w-5 px-1 md:px-1.5 text-[10px] md:text-xs">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? <ChevronUp className="h-3 w-3 md:h-4 md:w-4" /> : <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />}
          </Button>

          <div className="text-xs md:text-sm text-muted-foreground">
            <span className="hidden md:inline">Showing </span><span className="font-medium text-foreground">{filteredProjects}</span> of{" "}
            <span className="font-medium text-foreground">{totalProjects}</span>
          </div>
        </div>


        {/* <div className="text-sm text-muted-foreground">
          Showing {typeof visibleCount === "number" ? visibleCount : filteredProjects} of {typeof totalCount === "number" ? totalCount : totalProjects}
        </div> */}

        <div className="flex items-center gap-1 md:gap-2">
            {/* View mode toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("grid")}
              className="rounded-r-none min-h-[44px] min-w-[44px] px-2 md:px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("list")}
              className="rounded-l-none min-h-[44px] min-w-[44px] px-2 md:px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable filter section */}
      {isExpanded && (
        <div className="border rounded-lg p-3 md:p-4 space-y-3 md:space-y-4 bg-card max-w-full overflow-x-hidden">
          {/* Search bar with scope selector */}
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${searchScope === "all" ? "all fields" : searchScope}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-32 bg-transparent">
                  {searchScope === "all" ? "All fields" : searchScope === "tags" ? "Tags" : "Title"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Search in</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={searchScope} onValueChange={(v) => setSearchScope(v as SearchScope)}>
                  <DropdownMenuRadioItem value="all">All fields</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title">Title only</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="tags">Tags only</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap gap-3">
            {/* Show all / featured toggle (driven by prop) */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={showAll ? "default" : "outline"}
                size="sm"
                onClick={() => onShowAllToggle?.(true)}
                className="rounded-r-none"
              >
                All
              </Button>
              <Button
                variant={!showAll ? "default" : "outline"}
                size="sm"
                onClick={() => onShowAllToggle?.(false)}
                className="rounded-l-none"
              >
                Featured
              </Button>
            </div>

            {/* Domain filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Domain


                                                                        {selectedDomains.length > 0 && !selectedDomains.includes("all") && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                      {selectedDomains.length}
                    </Badge>
                  )}

                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {domains.map((domain) => (
                  <DropdownMenuCheckboxItem
                    key={domain}
                    checked={selectedDomains.includes(domain)}
                    onCheckedChange={() => toggleDomain(domain)}
                  >
                    {domain === "all" ? "Select All" : domain}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Medium filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Medium

                                    {selectedMediums.length > 0 && !selectedMediums.includes("all") && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                      {selectedMediums.length}
                    </Badge>
                  )}



                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {mediums.map((medium) => (
                  <DropdownMenuCheckboxItem
                    key={medium}
                    checked={selectedMediums.includes(medium)}
                    onCheckedChange={() => toggleMedium(medium)}
                  >
                    {medium === "all" ? "Select All" : medium}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Status
                                                      {selectedStatuses.length > 0 && !selectedStatuses.includes("all") && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                      {selectedStatuses.length}
                    </Badge>
                  )}


                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Select statuses</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  >
                    {status === "all" ? "Select All" : status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort dropdown */}
            <DropdownMenu >
              <DropdownMenuTrigger asChild className="ml-auto">
                <Button variant="outline" className="gap-2 bg-transparent">
                  Sort: {sortField === "title" ? "Title" : sortField === "createdAt" ? "Created" : "Updated"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                  <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="createdAt">Created date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="updatedAt">Updated date</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Order</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                  <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>


          </div>

          {/* Active filter badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {selectedDomains
                .filter((d) => d !== "all")
                .map((domain) => (
                  <Badge key={domain} variant="secondary" className="gap-1">
                    {domain}
                    <button onClick={() => toggleDomain(domain)} className="ml-1 hover:text-foreground">
                      ×
                    </button>
                  </Badge>
                ))}
              {selectedMediums
                .filter((m) => m !== "all")
                .map((medium) => (
                  <Badge key={medium} variant="secondary" className="gap-1">
                    {medium}
                    <button onClick={() => toggleMedium(medium)} className="ml-1 hover:text-foreground">
                      ×
                    </button>
                  </Badge>
                ))}
                {selectedStatuses
                  .filter((s) => s !== "all")
                  .map((status) => (
                    <Badge key={status} variant="secondary" className="gap-1">
                      {friendlyStatusLabel(status) || status}
                      <button onClick={() => toggleStatus(status)} className="ml-1 hover:text-foreground">
                        ×
                      </button>
                    </Badge>
                  ))}

                              {/* Clear filters */}
            {activeFilterCount > 0 && (
              <Button className="ml-auto " variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
