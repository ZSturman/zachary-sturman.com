"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import ResourceButton from "../resource-button";
import { CollectionItem, Project, Resource } from "@/types";
import { ContentViewer } from "./content-viewer";

// Helper function to get resources as array (handles both singular resource and resources array)
function getItemResources(item: CollectionItem): Resource[] {
  const resources: Resource[] = [];
  
  // Add resources array if exists
  if (item.resources && Array.isArray(item.resources)) {
    resources.push(...item.resources);
  }
  
  // Add singular resource if exists
  if (item.resource) {
    resources.push(item.resource);
  }
  
  // Filter out resources with empty url or label
  return resources.filter(resource => {
    return resource.url && resource.url !== '' && resource.label && resource.label !== '';
  });
}

interface CollectionFullscreenProps {
  item: CollectionItem;
  project: Project;
  //allItems: CollectionItem[]
  onClose: () => void;
  inModal?: boolean;
  folderName?: string;
  collectionName?: string;
  //onNavigate?: (item: CollectionItem) => void
}

export function CollectionFullscreen({
  item,
  project,
  onClose,
  inModal,
  folderName,
  collectionName,
}: CollectionFullscreenProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  
  const resources = getItemResources(item);

  // Prevent background scrolling when fullscreen is open (only when not in modal)
  useEffect(() => {
    if (!inModal) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position and body styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [inModal]);

  // If rendered inside the Project modal, prefer absolute positioning so
  // the fullscreen view is scoped to the modal container instead of the
  // entire viewport. When `inModal` is true, parent should provide
  // `relative` positioning.
  const containerClass = inModal
    ? "absolute inset-0 z-30 bg-background flex flex-col"
    : "fixed inset-0 z-50 bg-background flex flex-col";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          {project.title && (
            <h1 className="text-lg font-semibold">{project.title}</h1>
          )}

          <Badge variant="secondary">{item.type}</Badge>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Content viewer */}
        <div className={cn("flex-1 overflow-y-auto overflow-x-hidden", showSidebar && "pr-80")}>
          <div className="min-h-full flex items-center justify-center p-4">
            <ContentViewer item={item} folderName={folderName} collectionName={collectionName} />
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className={cn(
            // When inside modal we want the sidebar to be positioned
            // absolutely within the modal content area rather than fixed
            inModal ? "absolute right-0 top-0 bottom-0 w-80" : "fixed right-0 top-0 bottom-0 w-80",
            "border-l bg-background overflow-y-auto"
          )}>
            <div className="p-6 space-y-6">
              {/* Summary section */}
              {item.label && (
                <h2 className="text-lg font-semibold">{item.label}</h2>
              )}
              {item.summary && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    About
                  </h3>
                  <p className="text-sm leading-relaxed">{item.summary}</p>
                </div>
              )}

              {/* Resources section */}
              {resources.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {resources.map((resource, idx) => (
                      <ResourceButton key={idx} resource={resource} currentProject={project} />
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata section */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Details
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{item.type}</span>
                  </div>
                  {resources.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resources</span>
                      <span className="font-medium">
                        {resources.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar toggle */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "z-10 bg-transparent",
            inModal ? "absolute right-4 bottom-4" : "fixed right-4 bottom-4"
          )}
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? "Hide" : "Show"} Info
        </Button>
      </div>
    </div>
  );
}
