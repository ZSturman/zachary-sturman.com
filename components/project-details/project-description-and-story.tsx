"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/types";
import { formatTextWithNewlines } from "@/lib/utils";

interface Props {
  project: Project;
}

/**
 * Renders Description / Summary for a project.
 * Behavior:
 * - If neither description nor story -> returns null
 * - If only one is present -> renders it directly (no tabs)
 * - If both are present -> render Tabs to switch between them
 */
export default function ProjectDescriptionAndStory({ project }: Props) {
  const description =
    (project.description && String(project.description).trim()) || "";
  const story = (project.story && String(project.story).trim()) || "";

  const hasDescription = description.length > 0;
  const hasStory = story.length > 0;

  if (!hasDescription && !hasStory) return null;

  // Single renderer used in both the tab and single-view cases
  function RenderContent({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) {
    return (
      <Card>
        <CardContent className="p-3 md:p-6">
          {title && (
            <h2 className="text-base md:text-xl font-semibold mb-2">{title}</h2>
          )}
          <div className="prose max-w-none whitespace-pre-wrap text-sm md:text-base">
            {formatTextWithNewlines(content)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasDescription && !hasStory) {
    return <RenderContent title="Description" content={description} />;
  }

  if (!hasDescription && hasStory) {
    return <RenderContent title="Summary" content={story} />;
  }

  // Both present -> show tabs
  return (
    <div className="w-full">
      <Tabs defaultValue="story" className="w-full">
        <TabsList className="text-xs md:text-sm">
          <TabsTrigger
            value="story"
            className="text-xs md:text-sm px-2 md:px-4"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="description"
            className="text-xs md:text-sm px-2 md:px-4"
          >
            Description
          </TabsTrigger>
        </TabsList>

        <TabsContent value="story">
          <RenderContent title="Summary" content={story} />
        </TabsContent>

        <TabsContent value="description">
          <RenderContent title="Description" content={description} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProjectContentProps {
  project: Project;
}

export function ProjectContent({ project }: ProjectContentProps) {
  const description =
    (project.description && String(project.description).trim()) || "";
  const story = (project.story && String(project.story).trim()) || "";

  const hasDescription = description.length > 0;
  const hasStory = story.length > 0;

  if (!hasDescription && !hasStory) return null;

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {hasDescription && (
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Description</h2>
          <div className="text-base md:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {formatTextWithNewlines(description)}
          </div>
        </section>
      )}

      {hasStory && (
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Story</h2>
          <div className="text-base md:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap border-l-4 border-primary/20 pl-6">
            {formatTextWithNewlines(story)}
          </div>
        </section>
      )}
    </article>
  );
}
