"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { ProjectFilters } from "@/components/project-filters";
import { ProjectList } from "@/components/project-list/project-list";
import type { Project } from "@/types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PortfolioClientProps {
  projects: Project[];
}

export function PortfolioClient({ projects }: PortfolioClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // whether to show all public projects or the initial starred-only view
  const [showAll, setShowAll] = useState<boolean>(false);
  const showAllRef = useRef<boolean>(showAll)

  useEffect(() => { showAllRef.current = showAll }, [showAll])

  // Initialize from URL params once on mount
  useEffect(() => {
    // If there are any filter/query params present, prefer them.
    // Otherwise restore previously-saved filters from sessionStorage (fallback to localStorage for older data).
    const spEntries: Record<string, string> = searchParams
      ? Object.fromEntries(Array.from(searchParams.entries()))
      : {}
    const hasFilterParams = [
      "q",
      "medium",
      "mediums",
      "status",
      "tags",
      "searchScope",
      "sort",
      "view",
      "showAll",
    ].some((k) => typeof spEntries[k] === "string" && spEntries[k] !== "")

    if (hasFilterParams) {
      const sp = spEntries
      // parse filters
      const urlSearch = sp.q ?? ""
      // legacy `medium` used as domain; prefer `domain` param
      const urlDomain = sp.domain ? sp.domain.split(",").filter(Boolean) : (sp.medium ? sp.medium.split(",").filter(Boolean) : ["all"])
      const urlMediums = sp.mediums ? sp.mediums.split(",").filter(Boolean) : ["all"]
      const urlStatus = sp.status ? sp.status.split(",").filter(Boolean) : ["all"]
      const urlTags = sp.tags ? sp.tags.split(",").filter(Boolean) : []
      const urlSearchScope = (sp.searchScope as "all" | "title" | "tags") || "any"
      const urlSort = (typeof sp.sort === "string" ? sp.sort : "newest") as "newest" | "oldest" | "title-asc" | "title-desc"
      const urlView = (typeof sp.view === "string" ? sp.view : "list") as "grid" | "list"
      const urlShowAll = sp.showAll === "1" || sp.showAll === "true"
      setFilters({ search: urlSearch, medium: urlDomain, status: urlStatus, tags: urlTags })
      setExplicitMediums(urlMediums)
      setSearchScope(urlSearchScope)
      setSort(urlSort)
      setViewMode(urlView === "grid" ? "grid" : "list")
      setShowAll(Boolean(urlShowAll))
    } else {
      try {
        // Prefer sessionStorage (per-tab/session persistence). If nothing is there, fall back to localStorage
        const rawSession = typeof window !== "undefined" ? window.sessionStorage.getItem("portfolio.filters.v1") : null
        const rawLocal = typeof window !== "undefined" ? window.localStorage.getItem("portfolio.filters.v1") : null
        const raw = rawSession ?? rawLocal
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved) {
            // restored from session/sessionStorage/localStorage
            setFilters({ search: saved.search || "", medium: saved.medium || ["all"], status: saved.status || ["all"], tags: saved.tags || [] })
            setExplicitMediums(saved.explicitMediums || ["all"])
            setSearchScope(saved.searchScope || "all")
            setSort(saved.sort || "newest")
            setViewMode(saved.viewMode === "grid" ? "grid" : "list")
            setShowAll(Boolean(saved.showAll))
          }
        }
      } catch {
        // ignore restore errors
      }
    }
    // mark that initial restore has completed so subsequent sync effects may run
    setInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // active filters state (filters.medium represents selected DOMAINs for compatibility)
  const [filters, setFilters] = useState<{
    search: string;
    medium: string[]; // domain values
    status: string[];
    tags: string[];
  }>({ search: "", medium: ["all"], status: ["all"], tags: [] });
  // explicit medium selections (e.g. Mobile/Desktop/CLI/Novel)
  const [explicitMediums, setExplicitMediums] = useState<string[]>(["all"])
  // search scope: any/title/tags
  const [searchScope, setSearchScope] = useState<"all" | "title" | "tags">("all")

  const [sort, setSort] = useState<
    "newest" | "oldest" | "title-asc" | "title-desc"
  >("newest");

  type IncomingFilters = {
    search?: string
    domain?: string[]
    medium?: string[]
    mediums?: string[]
    status?: string[]
    tags?: string[]
    searchScope?: "all" | "title" | "tags"
  }

  const handleFilterChange = (next: IncomingFilters) => {
    // next may include { search, domain, medium, status, tags, searchScope }
    const domainSelection = next.domain ?? next.medium ?? ["all"]
    const explicit = next.mediums ?? next.medium ?? ["all"]
    const adapted = { search: next.search || "", medium: domainSelection, status: next.status || ["all"], tags: next.tags || [] }
    setFilters(adapted)
    setExplicitMediums(Array.isArray(explicit) ? explicit : [explicit])
    if (next.searchScope) setSearchScope(next.searchScope)

  // save to sessionStorage so leaving the main list and returning restores
    persistFiltersToSessionStorage({
      search: adapted.search || "",
      medium: adapted.medium || ["all"],
      status: adapted.status || ["all"],
      tags: adapted.tags || [],
      explicitMediums: Array.isArray(explicit) ? explicit : [explicit],
      searchScope: next.searchScope ?? searchScope,
    })

    // push to URL (encode domain as legacy `medium` param, explicit as `mediums`) so the main list page reflects the filters
    // Only update the URL if we're on the main list path (safety check)
    const scope = next.searchScope ?? searchScope
    const params = new URLSearchParams(Array.from(searchParams || []).concat([
      ["q", adapted.search || ""],
      ["medium", (adapted.medium || ["all"]).filter(Boolean).join(",")],
      ["mediums", (explicit || ["all"]).filter(Boolean).join(",")],
      ["status", (adapted.status || ["all"]).filter(Boolean).join(",")],
      ["tags", (adapted.tags || []).filter(Boolean).join(",")],
      ["searchScope", scope],
      ["sort", sort],
      ["view", viewMode],
      ["showAll", showAll ? "1" : "0"],
    ]))
    try {
      const url = `?${params.toString()}`
      if (initialized && (!pathname || pathname === "/")) router.replace(url)
    } catch {
      // router.replace may throw in certain environments; ignore and rely on sessionStorage
    }
  };

  // helper: persist current filter state to localStorage. optional overrides allow callers
  // to ensure latest changes (like showAll) are saved immediately.
  const [initialized, setInitialized] = useState(false)

  function persistFiltersToSessionStorage(overrides?: Partial<{
    search: string;
    medium: string[];
    status: string[];
    tags: string[];
    explicitMediums: string[];
    searchScope: string;
    sort: typeof sort;
    viewMode: typeof viewMode;
    showAll: boolean;
  }>) {
    try {
      const toSave = {
        search: overrides?.search ?? filters.search ?? "",
        medium: overrides?.medium ?? filters.medium ?? ["all"],
        status: overrides?.status ?? filters.status ?? ["all"],
        tags: overrides?.tags ?? filters.tags ?? [],
        explicitMediums: overrides?.explicitMediums ?? explicitMediums ?? ["all"],
        searchScope: overrides?.searchScope ?? searchScope ?? "all",
        sort: overrides?.sort ?? sort,
        viewMode: overrides?.viewMode ?? viewMode,
        showAll: overrides?.showAll ?? showAllRef.current,
      }
      if (typeof window !== "undefined") window.sessionStorage.setItem("portfolio.filters.v1", JSON.stringify(toSave))
    } catch {
      // ignore storage errors
    }
  }

  // wrapped setter for showAll which persists immediately and updates the URL if on main page
  function setShowAllAndPersist(v: boolean) {
    setShowAll(v)
    persistFiltersToSessionStorage({ showAll: v })
    try {
      if (!pathname || pathname === "/") {
        const params = new URLSearchParams(Array.from(searchParams || []))
        params.set("sort", sort)
        params.set("view", viewMode)
        params.set("showAll", v ? "1" : "0")
        const url = `?${params.toString()}`
        if (initialized) router.replace(url)
      }
    } catch {
      // ignore router errors
    }
  }

  const filteredProjects = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    // Base set: either all public projects or only starred projects
    const base = projects.filter((p) => {
      // visibility may not exist in some content sources; default to public
      const vis = (p as unknown as { visibility?: string })?.visibility;
      const isPublic = typeof vis === "string" ? vis === "public" : true;
      if (!isPublic) return false;
      if (showAll) return true;
      return Boolean((p as unknown as { featured?: boolean })?.featured);
    });

  return base.filter((p) => {
      // search matches according to searchScope
      if (s) {
        const inTitle = p.title.toLowerCase().includes(s) || (p.subtitle || "").toLowerCase().includes(s)
        const inTags = (p.tags || []).some((t) => t.toLowerCase().includes(s))
        const inSummary = (p.summary || "").toLowerCase().includes(s) || (p.description || "").toLowerCase().includes(s)
        if (searchScope === "title" && !inTitle) return false
        if (searchScope === "tags" && !inTags) return false
        if (searchScope === "all" && !inTitle && !inSummary && !inTags) return false
      }

      // domain filter: user selects domain ids
      if (
        filters.medium &&
        !(
          filters.medium.length === 0 ||
          (filters.medium.length === 1 && filters.medium[0] === "all")
        )
      ) {
        const projDomain = String(p.domain || "").toLowerCase();
        const matchesDomain = filters.medium.some((m) => projDomain === m.toLowerCase())
        if (!matchesDomain) return false
      }

      // status filter (multi-select): project status must match one of the selected, unless "all" selected
      if (
        filters.status &&
        !(
          filters.status.length === 0 ||
          (filters.status.length === 1 && filters.status[0] === "all")
        )
      ) {
        const status = (p as unknown as { status?: string })?.status;
        if (!status) return false;
        if (!filters.status.some((s) => s === status)) return false;
      }

      // explicit mediums filter: if user chose explicit mediums, ensure project has any of them
      if (explicitMediums && !(explicitMediums.length === 1 && explicitMediums[0] === "all")) {
        const projectMediums = new Set<string>()
        ;((p as Project) as unknown as { mediums?: string[] }).mediums?.forEach((m: string) => m && projectMediums.add(m.toLowerCase()))
        ;((p as Project) as unknown as { scriptMediums?: string[] }).scriptMediums?.forEach((m: string) => m && projectMediums.add(m.toLowerCase()))
        ;((p as Project) as unknown as { gameMediums?: string[] }).gameMediums?.forEach((m: string) => m && projectMediums.add(m.toLowerCase()))
        const required = explicitMediums.map((m) => m.toLowerCase())
        if (!required.some((r) => projectMediums.has(r))) return false
      }

      // tags filter: all selected tags must be present
      if (filters.tags && filters.tags.length > 0) {
        const projectTags = (p.tags || []).map((t) => t.toLowerCase());
        const required = filters.tags.map((t) => t.toLowerCase());
        if (!required.every((t) => projectTags.includes(t))) return false;
      }

      return true;
    });
  }, [projects, filters, showAll, explicitMediums, searchScope]);

  const sortedProjects = useMemo(() => {
    const copy = [...filteredProjects];
    function toTimestamp(v: unknown) {
      if (v == null || v === "") return 0;
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        // numeric string (unix timestamp) -> number
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
        // try ISO / date parse
        const d = Date.parse(v);
        return Number.isNaN(d) ? 0 : d;
      }
      if (v instanceof Date) return v.getTime();
      return 0;
    }
    switch (sort) {
      case "newest":
        return copy.sort((a, b) =>
          // newest first -> compare numeric timestamps
          toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
        );
      case "oldest":
        return copy.sort((a, b) =>
          // oldest first -> ascending timestamps
          toTimestamp(a.createdAt) - toTimestamp(b.createdAt)
        );
      case "title-asc":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return copy;
    }
  }, [filteredProjects, sort]);

  // Sync sort/view/showAll changes to URL
  useEffect(() => {
    if (!initialized) return

    // persist to sessionStorage
    try {
      const savedRaw = typeof window !== "undefined" ? window.sessionStorage.getItem("portfolio.filters.v1") : null
      const saved = savedRaw ? JSON.parse(savedRaw) : {}
      const toSave = {
        ...saved,
        sort,
        viewMode,
        showAll,
      }
      if (typeof window !== "undefined") window.sessionStorage.setItem("portfolio.filters.v1", JSON.stringify(toSave))
    } catch {
      console.error("Failed to save sort/view/showAll to sessionStorage")
    }

    // also update URL if on main list
    try {
      if (!pathname || pathname === "/") {
        const params = new URLSearchParams(Array.from(searchParams || []))
        params.set("sort", sort)
        params.set("view", viewMode)
        params.set("showAll", showAll ? "1" : "0")
        router.replace(`?${params.toString()}`)
      }
    } catch {
      // ignore router errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, viewMode, showAll])

  return (
    <>
      {initialized ? (
        <ProjectFilters
          projects={projects}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSortChange={(s) => setSort(s)}
          sort={sort}
          totalCount={projects.length}
          visibleCount={filteredProjects.length}
          showAll={showAll}
          onShowAllToggle={(v: boolean) => setShowAllAndPersist(v)}
          initialSearch={filters.search}
          initialMedium={filters.medium}
          initialStatus={filters.status}
          initialTags={filters.tags}
          initialSearchScope={searchScope}
        />
      ) : null}
      <ProjectList viewMode={viewMode} projects={sortedProjects} />
    </>
  );
}
