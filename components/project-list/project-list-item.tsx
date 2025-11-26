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
      className="p-6 hover:shadow-md transition-all duration-200 cursor-pointer group mb-2"
      onClick={onClick}
    >
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted aspect-square">
            <MediaDisplay
              src={thumbnailPath}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              loop={thumbnailSettings?.loop ?? true}
              autoPlay={thumbnailSettings?.autoPlay ?? true}
            />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {Boolean(
                  (project as unknown as { starred?: boolean }).starred
                ) && (
                  <span className="text-yellow-400" title="Starred">
                    ★
                  </span>
                )}
                {project.title}
              </h3>
              <div className="flex items-center gap-2">
                <DomainIcon className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant="outline"
                  className={STATUS_COLOR[project.status] || "bg-gray-100"}
                >
                  {project.phase ?? project.status}
                </Badge>

                    <ProjectMediums project={project} />
            
              </div>
            </div>

            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDate(project.updatedAt)}
            </span>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 whitespace-pre-wrap">
            {formatTextWithNewlines(project.summary)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {(project.tags || []).slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags && project.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.tags.length - 4}
                </Badge>
              )}
            </div>

        

            <div className="opacity-0 group-hover:opacity-100 scale-y-0 group-hover:scale-y-100  transition-transform ">
              <PrimaryActionButton project={project} resource={primaryLink} />
            </div>
        
          </div>
        </div>
      </div>
    </Card>
  );
}
