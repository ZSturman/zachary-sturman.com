"use client";

import type React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaDisplay } from "@/components/ui/media-display";
import { Project } from "@/types";
import { STATUS_COLOR } from "@/lib/resource-map";
import ProjectMediums from "../project-details/project-mediums";
import PrimaryActionButton from "./primary-action-button";
import { formatDate, getOptimizedMediaPath } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  compact?: boolean;
}

export function ProjectCard({
  project,
  onClick,
  compact = false,
}: ProjectCardProps) {

  const folderName = project.folderName || project.id;
  const folderPath = `/projects/${folderName}`;
  
  const thumb = getOptimizedMediaPath(project.images?.thumbnail, folderPath);
  const thumbnailSettings = project.imageSettings?.thumbnail;

  // no-op: using ResourceButton for external resources and router push for details

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg md:hover:scale-[1.01] bg-card border-border max-w-full overflow-hidden"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        {compact ? (
          <div className="relative overflow-hidden rounded-t-lg">
            <div className="relative aspect-square">
              <MediaDisplay
                src={thumb}
                alt={`${project.title} thumbnail`}
                fill
                className="object-cover"
                loop={thumbnailSettings?.loop ?? true}
                autoPlay={thumbnailSettings?.autoPlay ?? true}
              />
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-t-lg">
            {/* Main poster: fixed aspect so it never crops */}
            <div className="relative w-full aspect-video">
              <MediaDisplay
                src={thumb}
                alt={`${project.title} poster`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 800px, 100vw"
                priority={false}
                loop={thumbnailSettings?.loop ?? true}
                autoPlay={thumbnailSettings?.autoPlay ?? true}
              />

              <div className="absolute top-2 md:top-3 left-2 md:left-3">
                <Badge
                  variant="secondary"
                  className={`${
                    STATUS_COLOR[project.status as keyof typeof STATUS_COLOR]
                  } font-medium text-xs md:text-sm`}
                >
                  {(project.status || "").charAt(0).toUpperCase() +
                    (project.status || "").slice(1)}
                </Badge>
              </div>

              <div className="absolute top-2 md:top-3 right-2 md:right-3">
                <div className="flex items-center gap-1 md:gap-2">
                  <ProjectMediums project={project} />

                  {/* Starred badge */}
                  {Boolean(
                    (project as unknown as { starred?: boolean }).starred
                  ) && (
                    <div className="ml-0.5 md:ml-1 rounded-full bg-yellow-300 text-yellow-900 text-xs px-1.5 md:px-2 py-0.5 font-semibold">
                      ★
                    </div>
                  )}
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3 relative pb-16 md:pb-10 max-w-full">
        <div className="space-y-1.5 md:space-y-2 max-w-full">
          <div className="flex items-start justify-between gap-2 max-w-full">
            <h3 className="font-semibold text-sm md:text-base text-card-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 break-words max-w-full">
              {project.title}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 break-words max-w-full">
            {project.summary}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 max-w-full">
          {project.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] md:text-xs truncate max-w-full">
              {tag}
            </Badge>
          ))}
          {project.tags && project.tags.length > 3 && (
            <Badge variant="outline" className="text-[10px] md:text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 max-w-full">
            {/* Single primary action: visible on mobile, hover on desktop */}
            <div className="ml-auto">
              <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-y-100 md:scale-y-0 md:group-hover:scale-y-100 transition-transform">
                <PrimaryActionButton project={project} resource={Array.isArray(project.resources) && project.resources.length > 0 ? project.resources[0] : undefined} />
              </div>
            </div>
        </div>

        <div className="absolute bottom-2 md:bottom-3 left-3 right-3 text-[10px] md:text-xs text-muted-foreground flex justify-between items-center gap-2 max-w-full">
          <span className="truncate">Updated: {formatDate(project.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
