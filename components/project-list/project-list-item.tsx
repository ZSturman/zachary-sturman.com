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
  
  // Note: no extra derived project shape needed here; `project` is used directly
  return (
    <Card
      className="p-3 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group mb-2 max-w-full overflow-hidden"
      onClick={onClick}
    >
      <div className="flex gap-3 md:gap-6 max-w-full">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted aspect-square">
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
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4 mb-2 md:mb-3 max-w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 min-w-0 max-w-full">
              <h3 className="text-sm md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 break-words max-w-full">
                {Boolean(
                  (project as unknown as { starred?: boolean }).starred
                ) && (
                  <span className="text-yellow-400" title="Starred">
                    ★{" "}
                  </span>
                )}
                {project.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1 md:gap-2">
                <DomainIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                <Badge
                  variant="outline"
                  className={`${STATUS_COLOR[project.status] || "bg-gray-100"} text-[10px] md:text-xs whitespace-nowrap`}
                >
                  {project.phase ?? project.status}
                </Badge>
                <ProjectMediums project={project} />
              </div>
            </div>

            <span className="text-[10px] md:text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
              {formatDate(project.updatedAt)}
            </span>
          </div>

          <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 whitespace-pre-wrap break-words max-w-full">
            {formatTextWithNewlines(project.summary)}
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 max-w-full">
            <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
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

            {/* Make button visible on mobile, hover on desktop */}
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-y-100 md:scale-y-0 md:group-hover:scale-y-100 transition-transform flex-shrink-0">
              <PrimaryActionButton project={project} resource={primaryLink} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
