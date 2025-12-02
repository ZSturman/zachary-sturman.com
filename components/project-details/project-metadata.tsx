import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { Calendar, AlertCircle } from "lucide-react";

interface ProjectMetadataProps {
  project: Project;
}

export function ProjectMetadata({ project }: ProjectMetadataProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: string, subStatus?: string) => {
    if (subStatus) {
      return `${status} (${subStatus.replace(/_/g, " ")})`;
    }
    return status.replace(/_/g, " ");
  };

  return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          {project.status && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Status</p>
              <Badge
                variant={project.status === "done" ? "default" : "secondary"}
              >
                {getStatusLabel(project.status, project.phase)}
              </Badge>
            </div>
          )}

          {project.createdAt && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
          )}

          {project.updatedAt && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Last Updated</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {formatDate(project.updatedAt)}
                </span>
              </div>
            </div>
          )}

          {project.requiresFollowUp && (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-900 dark:text-amber-200">
                Requires follow-up
              </span>
            </div>
          )}

          {project.category && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Category</p>
              <Badge variant="secondary" className="text-xs">
                {project.category}
              </Badge>
            </div>
          )}

          {project.domain && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Domain</p>
              <Badge variant="outline" className="text-xs">
                {project.domain}
              </Badge>
            </div>
          )}

          {project.genres && project.genres.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Genres</p>
              <div className="flex flex-wrap gap-1">
                {project.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {project.mediums && project.mediums.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Mediums</p>
              <div className="flex flex-wrap gap-1">
                {project.mediums.map((medium) => (
                  <Badge key={medium} variant="secondary" className="text-xs">
                    {medium}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
