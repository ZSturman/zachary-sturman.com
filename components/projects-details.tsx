"use client";
import { notFound, useRouter } from "next/navigation";
import { ProjectHeader } from "./project-details/project-banner";
import { ProjectContent } from "./project-details/project-description-and-story";
import { ProjectMetadata } from "./project-details/project-metadata";
import ResourceButtons from "./project-details/resource-buttons";
import { Project } from "@/types";
import { Collection } from "./project-details/collection/collection";
import { useBreadcrumb } from "@/lib/breadcrumb-context";
import { ArrowLeft } from "lucide-react";
import ProjectDetailsFooter from "./project-details/project-details-footer";
import ProjectDetailsMediaDisplay from "./project-details/project-details-media-display";

interface ProjectDetailsProps {
  project: Project;
}

function HomeLink() {
  const { previousPath, previousLabel } = useBreadcrumb();
  const router = useRouter();

  const handleBack = () => {
    if (previousPath) {
      router.push(previousPath);
    } else {
      router.push("/");
    }
  };

  const label = previousLabel || "Home";

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
      <div className="container  px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeLink />

      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <ProjectHeader project={project} />

        <div className="mt-12 space-y-8">
          {/* Priority: Collection/Media first */}
          {project.collection && (
            <div>
              <Collection project={project} inModal={false} />
            </div>
          )}

          {/* Resources section */}
          {project.resources && project.resources.length > 0 && (
            <div>
              <ResourceButtons project={project} />
            </div>
          )}

          {/* Metadata and About/Story arranged responsively in a grid.
              If there's no description/story, show metadata full-width. */}
          {(() => {
            const hasContent = Boolean(
              (project.description && String(project.description).trim()) ||
                (project.story && String(project.story).trim())
            );

            if (!hasContent) {
              return (
                <div className="grid gap-6">
                  <ProjectMetadata project={project} />
                </div>
              );
            }

            return (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-[1fr_320px] items-start md:items-stretch">
                <div className="min-w-0 h-full">
                  <div className="h-full flex flex-col">
                    <ProjectContent project={project} />
                  </div>
                  <div className="block md:hidden">
                    <ProjectDetailsMediaDisplay project={project} />
                  </div>
                </div>

                <aside className="min-w-[280px] md:min-w-[320px]">
                  <div className="h-full">
                    <div className="hidden md:block">
                      <ProjectDetailsMediaDisplay project={project} />
                    </div>
                    <ProjectMetadata project={project} />
                  </div>
                </aside>
              </div>
            );
          })()}
        </div>

        <ProjectDetailsFooter />
      </div>
    </div>
  );
}
