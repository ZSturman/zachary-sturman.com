"use client"

import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Project } from "@/types"
import { formatTextWithNewlines } from "@/lib/utils"

interface Props {
	project: Project
	showStory?: boolean
}

/**
 * Renders Description / Summary for a project.
 * Behavior:
 * - If neither description nor summary -> returns null
 * - If only one is present -> renders it directly (no tabs)
 * - If both are present -> render Tabs to switch between them
 */
export default function ProjectDescriptionAndStory({ project, showStory = true }: Props) {
	const description = (project.description && String(project.description).trim()) || ""
	const summary = (project.summary && String(project.summary).trim()) || ""

	const hasDescription = description.length > 0
	const hasSummary = summary.length > 0

	if (!hasDescription && !hasSummary) return null

	// Single renderer used in both the tab and single-view cases
	function RenderContent({ title, content }: { title: string; content: string }) {
		return (
			<Card>
				<CardContent className="p-3 md:p-6">
					{title && <h2 className="text-base md:text-xl font-semibold mb-2">{title}</h2>}
					<div className="prose max-w-none whitespace-pre-wrap text-sm md:text-base">{formatTextWithNewlines(content)}</div>
				</CardContent>
			</Card>
		)
	}

	if (hasDescription && !hasSummary) {
		return <RenderContent title="Description" content={description} />
	}

	if (!hasDescription && hasSummary) {
		return <RenderContent title="Summary" content={summary} />
	}

	// Both present -> show tabs
	return (
		<div className="w-full">
			<Tabs defaultValue="summary" className="w-full">
				<TabsList className="text-xs md:text-sm">
					<TabsTrigger value="summary" className="text-xs md:text-sm px-2 md:px-4">Summary</TabsTrigger>
					<TabsTrigger value="description" className="text-xs md:text-sm px-2 md:px-4">Description</TabsTrigger>
				</TabsList>

				<TabsContent value="summary">
					<RenderContent title="Summary" content={summary} />
				</TabsContent>

				<TabsContent value="description">
					<RenderContent title="Description" content={description} />
				</TabsContent>
			</Tabs>
		</div>
	)
}



interface ProjectContentProps {
  project: Project
}

export function ProjectContent({ project }: ProjectContentProps) {

		const description = (project.description && String(project.description).trim()) || ""
	const summary = (project.summary && String(project.summary).trim()) || ""

	const hasDescription = description.length > 0
	const hasSummary = summary.length > 0

	if (!hasDescription && !hasSummary) return null


  return (
    <div className="space-y-8">


      {hasDescription && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">About</h2>
          <p className="text-pretty leading-relaxed text-muted-foreground whitespace-pre-wrap">{formatTextWithNewlines(description)}</p>
        </section>
      )}

      {project.story && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Story</h2>
          <p className="text-pretty leading-relaxed text-muted-foreground whitespace-pre-wrap">{formatTextWithNewlines(project.story)}</p>
        </section>
      )}

      {project.tags && project.tags.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
