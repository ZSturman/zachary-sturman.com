import { Project } from "@/types";
import Image from "next/image";
import React from "react";
import { formatTextWithNewlines } from "@/lib/utils";
import ResourceButton from "./resource-button";
import ResourceButtons from "./resource-buttons";

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {

  const folderName = project.folderName || project.id;
  
  // Helper to get optimized image path
  const getOptimizedPath = (imagePath: string | undefined): string | null => {
    if (!imagePath) return null;
    
    // If already optimized, use as-is
    if (imagePath.includes('-optimized') || imagePath.includes('-thumb')) {
      return `/projects/${folderName}/${imagePath}`;
    }
    
    // Convert to optimized version
    const withoutExt = imagePath.replace(/\.[^.]+$/, '');
    return `/projects/${folderName}/${withoutExt}-optimized.webp`;
  };
  
  const srcBanner = project.images &&
    typeof project.images.banner === "string" &&
    project.images.banner
      ? getOptimizedPath(project.images.banner)
      : null;
  return (
    <header className="space-y-3 md:space-y-6 border-b border-border pb-4 md:pb-8">
      {srcBanner && (
        <div className="relative -mx-3 md:-mx-6 -mt-3 md:-mt-6 mb-3 md:mb-6 h-32 md:h-48 lg:h-64 overflow-hidden rounded-t-lg">
          <Image
            src={srcBanner || "/placeholder.svg"}
            alt=""
            fill
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 md:gap-4">
        <div className="flex-1 space-y-1 md:space-y-2">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <h1 className="text-balance font-sans text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {project.title}
            </h1>
            {/* Resource buttons as icons */}
            {project.resources && project.resources.length > 0 && (
              <div className="flex gap-2">
                {project.resources.slice(0, 4).map((resource) => (
                  <ResourceButton key={resource.url} resource={resource} iconOnly className="h-8 w-8 hover:cursor-pointer border-0" />
                ))}
              </div>
            )}
          </div>
          {project.subtitle && <p className="text-pretty text-sm md:text-lg text-muted-foreground">{project.subtitle}</p>}
        </div>
      </div>

      <p className="text-pretty text-sm md:text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">{formatTextWithNewlines(project.summary)}</p>


          {/* Resources section */}
          {project.resources && project.resources.length > 0 && (
            <div>
              <ResourceButtons project={project} />
            </div>
          )}
    </header>
  )
}
