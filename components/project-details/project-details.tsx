"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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

function HomeLink({ projectTitle, isScrolled }: { projectTitle: string; isScrolled: boolean }) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="container mx-auto px-3 md:px-6 lg:px-8 py-2 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            ← <span className="hidden md:inline">Home</span>
          </Link>
          
          {/* Show title when scrolled on mobile */}
          {isScrolled && (
            <h2 className="md:hidden text-xs font-medium text-foreground truncate flex-1 text-center px-2">
              {projectTitle}
            </h2>
          )}
          
          <div className="w-8 md:hidden" /> {/* Spacer for centering on mobile */}
        </div>
      </div>
    </div>
  );
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled past the header
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setIsScrolled(headerBottom < 60); // 60px is approximately the sticky nav height
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* <ProjectBanner project={project} /> */}

      <HomeLink projectTitle={project.title} isScrolled={isScrolled} />

      {/* Main Content - Adaptive Layout */}
      <main className="container mx-auto px-3 md:px-6 lg:px-8 py-6 md:py-12 lg:py-16">
        {/* <ProjectHero project={project} /> */}

        <div ref={headerRef}>
          <ProjectHeader project={project} />
        </div>

        {/* Tags directly under header - no title */}
        <ProjectTags project={project} />

        <div className="mt-4 md:mt-8">
          <ProjectDescriptionAndStory project={project}/>
        </div>

        <ProjectMediums project={project} />

        <Collection project={project} inModal={false} />

        {/* Story section at the very bottom */}
        {project.story && (
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t">
            <details className="group">
              <summary className="cursor-pointer text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors list-none flex items-center gap-2">
                <span className="text-muted-foreground group-open:rotate-90 transition-transform">▶</span>
                Story
              </summary>
              <div className="mt-3 md:mt-4 pl-4 md:pl-6 border-l-2 border-muted">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.story}
                </p>
              </div>
            </details>
          </div>
        )}
      </main>
    </div>
  );
}



