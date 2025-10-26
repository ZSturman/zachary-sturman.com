"use client"
import { notFound } from "next/navigation";
import { ProjectHeader } from "./project-details/project-banner";
import { ProjectContent } from "./project-details/project-description-and-story";
import { ProjectMetadata } from "./project-details/project-metadata";
import ResourceButtons from "./project-details/resource-buttons";
import { Project } from "@/types";
import Link from "next/link";
import { Collection } from "./project-details/collection/collection";

interface ProjectDetailsProps {
  project: Project;
}

function HomeLink() {
  return (
    <div className="sticky top-0 z-10 ">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Home
          </Link>
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

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px]">
            <div className="space-y-12">
            <ProjectContent project={project} />
            {project.collection && <Collection project={project} inModal={false} />}
          </div>

          <aside className="space-y-8">
            <ProjectMetadata project={project} />
            {project.resources && project.resources.length > 0 && (
              <ResourceButtons project={project} />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
