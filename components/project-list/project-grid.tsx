// "use client"

// import { useRouter } from "next/navigation"
// import { ProjectCard } from "@/components/project-list/project-card"
// import { ProjectListItem } from "@/components/project-list/project-list-item"

// import type { Project } from "@/types"

// interface ProjectGridProps {
//   viewMode?: "grid" | "list"
//   projects: Project[]
// }

// export function ProjectGrid({ viewMode = "list", projects }: ProjectGridProps) {
//   const router = useRouter()
//   const handleClick = (id: string) => {
//     router.push(`/?project=${id}`, { scroll: false })
//     router.prefetch(`/projects/${id}`)
//   }
//   // Navigate to intercepting modal route when clicking — use the (modal) route group.
//   return (
//     <>
//       {viewMode === "grid" ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {projects.map((project, idx) => (
//             <ProjectCard
//               key={project.id + idx}
//               project={project}
//               onClick={() => handleClick(project.id)}
//               compact
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {projects.map((project, idx) => (
//             <ProjectListItem
//               key={project.id + idx}
//               project={project}
//               onClick={() => handleClick(project.id)}
//             />
//           ))}
//         </div>
//       )}
//     </>
//   );
// }
