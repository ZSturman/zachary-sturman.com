import { Project } from "@/types";
import Image from "next/image";
import React from "react";

// const ProjectBanner = ({ project }: { project: Project }) => {
//   const srcBanner =
//     project.images &&
//     typeof project.images.banner === "string" &&
//     project.images.banner
//       ? `/projects/${project.id}/${project.images.banner}`
//       : null;

//   if (!srcBanner) return null;
//   return (
//     <div className="relative w-full aspect-[4/1] h-50 overflow-hidden bg-muted">
//       {/* Blurred background layer */}
//       <div className="absolute inset-0">
//         <Image
//           src={srcBanner || "/placeholder.svg"}
//           alt=""
//           fill
//           className="object-cover blur-2xl scale-110 opacity-60"
//           priority
//         />
//       </div>
//       {/* Centered actual image */}
//       <div className="absolute inset-0 flex items-center justify-center p-4">
//         <div className="relative w-full h-full">
//           <Image
//             src={srcBanner || "/placeholder.svg"}
//             alt={`${project.title} banner`}
//             fill
//             className="object-contain"
//             priority
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectBanner;



import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {

      const srcBanner = project.images &&
    typeof project.images.banner === "string" &&
    project.images.banner
      ? `/projects/${project.id}/${project.images.banner}`
      : null;
  return (
    <header className="space-y-6 border-b border-border pb-8">
      {srcBanner && (
        <div className="relative -mx-6 -mt-6 mb-6 h-48 overflow-hidden rounded-t-lg md:h-64">
          <Image
            src={srcBanner || "/placeholder.svg"}
            alt=""
            fill
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-balance font-sans text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {project.title}
            </h1>
           {/*  {project.starred && <Star className="h-6 w-6 fill-amber-400 text-amber-400" />} */}
          </div>
          {project.subtitle && <p className="text-pretty text-lg text-muted-foreground">{project.subtitle}</p>}
        </div>
      </div>

      <p className="text-pretty text-xl leading-relaxed text-foreground">{project.summary}</p>

      {(project.category || project.domain || project.genres?.length || project.mediums?.length) && (
        <div className="flex flex-wrap gap-2">
          {project.category && (
            <Badge variant="secondary" className="text-sm">
              {project.category}
            </Badge>
          )}
          {project.domain && (
            <Badge variant="outline" className="text-sm">
              {project.domain}
            </Badge>
          )}
          {project.genres?.map((genre) => (
            <Badge key={genre} variant="outline" className="text-sm">
              {genre}
            </Badge>
          ))}
          {project.mediums?.map((medium) => (
            <Badge key={medium} variant="secondary" className="text-sm">
              {medium}
            </Badge>
          ))}
        </div>
      )}
    </header>
  )
}
