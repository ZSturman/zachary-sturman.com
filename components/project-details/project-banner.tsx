import { Project } from "@/types";
import Image from "next/image";
import React from "react";
import { formatTextWithNewlines } from "@/lib/utils";

import { Badge } from "@/components/ui/badge"

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

      <p className="text-pretty text-xl leading-relaxed text-foreground whitespace-pre-wrap">{formatTextWithNewlines(project.summary)}</p>

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
