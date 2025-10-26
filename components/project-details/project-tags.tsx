import { Project } from "@/types";
import { Badge } from "../ui/badge";

export default function ProjectTags({ project }: { project: Project }) {
  return project.tags?.length ? (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  ) : null;
}