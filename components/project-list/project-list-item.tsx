"use client";

import { Badge } from "@/components/ui/badge";
// Button is unused here; PrimaryActionButton provides the action button
import { Card } from "@/components/ui/card";
import { STATUS_COLOR } from "@/lib/resource-map";
import type { Project } from "@/types";

import { MediaDisplay } from "@/components/ui/media-display";
import ProjectMediums from "../project-details/project-mediums";
import { formatDate, getOptimizedMediaPath, formatTextWithNewlines } from "@/lib/utils";
import ResourceButton from "../project-details/resource-button";

export interface ProjectListItemProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectListItem({ project, onClick }: ProjectListItemProps) {
  const folderName = project.folderName || project.id;
  const folderPath = `/projects/${folderName}`;
  
  const thumbnailPath = getOptimizedMediaPath(project.images?.thumbnail, folderPath);
  const thumbnailSettings = project.imageSettings?.thumbnail;

  // Get status/phase value and check if it should be displayed
  const statusValue = project.phase ?? project.status;
  const showStatusBadge = statusValue && statusValue.trim() !== "";
  
  // Note: no extra derived project shape needed here; `project` is used directly
  return (
    <Card
      className="p-2 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group mb-2 max-w-full overflow-hidden"
      onClick={onClick}
    >
      <div className="flex flex-row-reverse md:flex-row gap-2 md:gap-6 max-w-full">
        {/* Thumbnail - Right on mobile, Left on desktop */}
        <div className="flex-shrink-0 ">
          <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 rounded-lg overflow-hidden bg-muted aspect-square">
            <MediaDisplay
              src={thumbnailPath}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover md:group-hover:scale-105 transition-transform duration-200"
              loop={thumbnailSettings?.loop ?? true}
              autoPlay={thumbnailSettings?.autoPlay ?? true}
            />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0 max-w-full overflow-hidden">
          <div className="flex flex-row items-center justify-between gap-1 md:gap-4 mb-1 md:mb-3 me-1.5 max-w-full">
            <div className="flex flex-col items-start gap-0.5 md:gap-1 min-w-0 flex-1">
              <h3 className="text-xs md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors break-words">
                {Boolean(
                  (project as unknown as { featured?: boolean }).featured
                ) && (
                  <span className="text-yellow-400" title="Starred">
                    ★{" "}
                  </span>
                )}
                {project.title}
              </h3>
              <div className="flex flex-wrap items-center gap-0.5 md:gap-2">
                {showStatusBadge && (
                  <Badge
                    variant="outline"
                    className={`${STATUS_COLOR[project.status]} text-[8px] md:text-xs whitespace-nowrap`}
                  >
                    {statusValue}
                  </Badge>
                )}
                <ProjectMediums project={project} />
              </div>
            </div>

            <span className="text-[9px] md:text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
              {formatDate(project.updatedAt)}
            </span>
          </div>

          <p className="text-muted-foreground text-[10px] md:text-sm mb-1.5 md:mb-4 line-clamp-3 whitespace-pre-wrap break-words max-w-full">
            {formatTextWithNewlines(project.summary)}
          </p>

          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between md:gap-2 max-w-full">
            <div className="hidden md:flex flex-wrap gap-1 max-w-full overflow-hidden">
              {(project.tags || []).slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-[10px] md:text-xs truncate">
                  {tag}
                </Badge>
              ))}
              {project.tags && project.tags.length > 4 && (
                <Badge variant="secondary" className="text-[10px] md:text-xs">
                  +{project.tags.length - 4}
                </Badge>
              )}
            </div>

            {/* Resource icons and primary action */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Show resource buttons as icons */}
              {project.resources && project.resources.map((resource) => (
                <ResourceButton key={resource.url} resource={resource} iconOnly className="h-7 w-7" />
              ))}
              
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
