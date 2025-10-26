import { Badge } from "@/components/ui/badge"
import { Project } from "@/types"
import { Calendar, Eye, AlertCircle } from "lucide-react"
import Image from "next/image"


interface ProjectMetadataProps {
  project: Project
}

export function ProjectMetadata({ project }: ProjectMetadataProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusLabel = (status: string, subStatus?: string) => {
    if (subStatus) {
      return `${status} (${subStatus.replace(/_/g, " ")})`
    }
    return status.replace(/_/g, " ")
  }

  const poster = project.images?.posterPortrait || project.images?.posterLandscape
  const posterOrientation = project.images?.posterPortrait ? "portrait" : "landscape"

  const posterPath = poster ? `/projects/${project.id}/${poster}` : "/placeholder.svg"
  const thumbnailPath = project.images?.thumbnail ? `/projects/${project.id}/${project.images.thumbnail}` : "/placeholder.svg"

  return (
    <div className="space-y-6">
      {poster && (
        <div className="overflow-hidden rounded-lg border border-border relative">

          <Image
            src={posterPath}
            alt={`${project.title} poster`}
            width={100}
            height={100}
            className={`w-full object-cover ${posterOrientation === "portrait" ? "aspect-[2/3]" : "aspect-video"}`}
          />
        </div>
      )}

      {project.images?.thumbnail && !poster && (
        <div className="overflow-hidden rounded-lg border border-border relative">
          <Image
            src={thumbnailPath}
            alt={`${project.title} thumbnail`}
            fill
            className="w-full object-cover aspect-video"
          />
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-6">Details</h3>

        <div className="space-y-4">
          {project.status && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Status</p>
              <Badge variant={project.status === "done" ? "default" : "secondary"}>
                {getStatusLabel(project.status, project.subStatus)}
              </Badge>
            </div>
          )}


          {project.createdAt && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          )}

          {project.updatedAt && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Last Updated</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          )}

          {project.requiresFollowUp && (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-900 dark:text-amber-200">Requires follow-up</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
