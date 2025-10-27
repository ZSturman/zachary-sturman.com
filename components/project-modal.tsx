"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Project } from "@/types";
import { ProjectHeader } from "./project-details/project-banner";
import { ProjectContent } from "./project-details/project-description-and-story";

import { ProjectMetadata } from "./project-details/project-metadata";
import ResourceButtons from "./project-details/resource-buttons";
import { Collection } from "./project-details/collection/collection";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";


interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const router = useRouter();
  
  const goToProjectPage = () => {
    if (!project) return;
    onClose();
    // Use Next.js router for proper client-side navigation
    router.push(`/projects/${project.id}`);
  };



  if (!project) return null;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle>
        <span className="sr-only">
          {project.title}
          Preview
        </span>
      </DialogTitle>

      
      <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto p-4">

        <div className="relative">
          <ProjectHeader project={project} />

          <div>
            <Button onClick={goToProjectPage} >
              Go to Project Page
            </Button>

          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-8">
            <ProjectContent project={project} />
            {project.collection && <Collection project={project} inModal={true} />}
          </div>

          <aside className="space-y-6">
            <ProjectMetadata project={project} />
            {project.resources && project.resources.length > 0 && (
              <ResourceButtons project={project} />
            )}
          </aside>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
