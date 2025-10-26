"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import ResourceButton from "../resource-button";
import { CollectionItem, Project } from "@/types";
import { ContentViewer } from "./content-viewer";

interface CollectionFullscreenProps {
  item: CollectionItem;
  project: Project;
  //allItems: CollectionItem[]
  onClose: () => void;
  inModal?: boolean;
  //onNavigate?: (item: CollectionItem) => void
}

export function CollectionFullscreen({
  item,
  project,
  onClose,
  inModal,
}: CollectionFullscreenProps) {
  const [showSidebar, setShowSidebar] = useState(true);

  // If rendered inside the Project modal, prefer absolute positioning so
  // the fullscreen view is scoped to the modal container instead of the
  // entire viewport. When `inModal` is true, parent should provide
  // `relative` positioning.
  const containerClass = inModal
    ? "absolute inset-0 z-30 bg-background"
    : "fixed inset-0 z-50 bg-background";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b">
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
  <div className="flex h-full pt-16">
        {/* Content viewer */}
        <div className={cn("flex-1 overflow-auto", showSidebar && "pr-80")}>
          <div className="h-full flex items-center justify-center">
            <ContentViewer item={item} />
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className={cn(
            // When inside modal we want the sidebar to be positioned
            // absolutely within the modal content area rather than fixed
            inModal ? "absolute right-0 top-16 bottom-0 w-80" : "fixed right-0 top-16 bottom-0 w-80",
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
              {item.resources && item.resources.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {item.resources.map((resource, idx) => (
                      <ResourceButton key={idx} resource={resource} />
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
                  {item.resources && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resources</span>
                      <span className="font-medium">
                        {item.resources.length}
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
