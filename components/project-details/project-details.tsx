"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types";
import { formatDate } from "@/lib/utils";

import { ProjectHeader } from "./project-banner";
import ProjectMediums from "./project-mediums";
import ProjectTags from "./project-tags";
import ProjectHero from "./project-hero";
import { Collection } from "./collection/collection";
import ProjectDescriptionAndStory from "./project-description-and-story"

interface ProjectDetailsProps {
  project: Project;
}

function HomeLink() {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
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

export function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* <ProjectBanner project={project} /> */}

      <HomeLink />

      {/* Main Content - Adaptive Layout */}
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* <ProjectHero project={project} /> */}

        <ProjectHeader project={project} />

        <div className="mt-8">
          <ProjectDescriptionAndStory project={project} />
        </div>

        <ProjectMediums project={project} />

        <ProjectTags project={project} />

        <Collection project={project} inModal={false} />
      </main>
    </div>
  );
}



