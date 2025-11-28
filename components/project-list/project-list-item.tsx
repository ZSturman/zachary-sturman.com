"use client";

import { Badge } from "@/components/ui/badge";
// Button is unused here; PrimaryActionButton provides the action button
import { Card } from "@/components/ui/card";
import { STATUS_COLOR } from "@/lib/resource-map";
import type { Project } from "@/types";

import {
  Code,
  BookOpen,
  PenTool,
  Cpu,
} from "lucide-react";
import { MediaDisplay } from "@/components/ui/media-display";
import ProjectMediums from "../project-details/project-mediums";
import { formatDate, getOptimizedMediaPath, formatTextWithNewlines } from "@/lib/utils";
import PrimaryActionButton from "./primary-action-button";

// Map domain to icon
const domainIcons = {
  Technology: Cpu,
  Creative: PenTool,
  Expository: BookOpen,
};

export interface ProjectListItemProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectListItem({ project, onClick }: ProjectListItemProps) {
  // Pick icon based on domain
  const DomainIcon =
    domainIcons[project.domain as keyof typeof domainIcons] || Code;
  const primaryLink =
    Array.isArray(project.resources) && project.resources.length > 0
      ? project.resources[0]
      : undefined;
  
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
            <div className="flex flex-row md:flex-col items-center md:items-start gap-0.5 md:gap-1 min-w-0 max-w-full">
              <h3 className="text-xs md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 break-words max-w-full">
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
                <DomainIcon className="h-2.5 w-2.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                {showStatusBadge && (
                  <Badge
                    variant="outline"
                    className={`${STATUS_COLOR[project.status] || "bg-gray-100"} text-[8px] md:text-xs whitespace-nowrap py-0 px-1 md:px-2`}
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

            {/* Make button visible on mobile (full width), hover on desktop */}
            <div className="w-full md:w-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-y-100 md:scale-y-0 md:group-hover:scale-y-100 transition-transform flex-shrink-0">
              <PrimaryActionButton project={project} resource={primaryLink} className="w-full md:w-auto justify-center md:justify-start gap-1.5 md:gap-3 h-auto p-1.5 md:p-2 md:px-4 px-2 bg-transparent max-w-full hover:cursor-pointer min-h-[32px] md:min-h-[44px] text-[10px] md:text-sm" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
