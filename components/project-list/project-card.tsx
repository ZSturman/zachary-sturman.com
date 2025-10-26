"use client";

import type React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Image from "next/image";
import { Project } from "@/types";
import { STATUS_COLOR } from "@/lib/resource-map";
import { formatDate } from "@/lib/utils";
import ProjectMediums from "../project-details/project-mediums";
import PrimaryActionButton from "./primary-action-button";

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

  const thumb =
    project.images &&
    typeof project.images.thumbnail === "string" &&
    project.images.thumbnail
      ? `/projects/${project.id}/${project.images.thumbnail}`
      : "/placeholder.svg";

  // no-op: using ResourceButton for external resources and router push for details

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-card border-border"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        {compact ? (
          <div className="relative overflow-hidden rounded-t-lg">
            <div className="relative aspect-square">
              <Image
                src={thumb}
                alt={`${project.title} thumbnail`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-t-lg">
            {/* Main poster: fixed aspect so it never crops */}
            <div className={`relative w-full `}>
              <Image
                src={thumb}
                alt={`${project.title} poster`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 800px, 100vw"
                priority={false}
              />

              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className={`${
                    STATUS_COLOR[project.status as keyof typeof STATUS_COLOR]
                  } font-medium`}
                >
                  {(project.status || "").charAt(0).toUpperCase() +
                    (project.status || "").slice(1)}
                </Badge>
              </div>

              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-2">
                  <ProjectMediums project={project} />

                  {/* Starred badge */}
                  {Boolean(
                    (project as unknown as { starred?: boolean }).starred
                  ) && (
                    <div className="ml-1 rounded-full bg-yellow-300 text-yellow-900 text-xs px-2 py-0.5 font-semibold">
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

      <CardContent className="p-4 space-y-3 relative pb-10">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-card-foreground leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {project.summary}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {project.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags && project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
            {/* Single primary action: either the primary resource or a Details button */}
            <div className="ml-auto">
              <div className="opacity-0 group-hover:opacity-100 scale-y-0 group-hover:scale-y-100 transition-transform">
                <PrimaryActionButton project={project} resource={Array.isArray(project.resources) && project.resources.length > 0 ? project.resources[0] : undefined} />
              </div>
            </div>

          {Array.isArray(project.resources) && project.resources.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs ml-auto"
              onClick={onClick}
            >
              <Eye className="h-3 w-3" />
              View More
            </Button>
          )}

          <div className="absolute bottom-3 right-3 text-sm text-muted-foreground ">
            <div>Last Updated: {formatDate(project.updatedAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
