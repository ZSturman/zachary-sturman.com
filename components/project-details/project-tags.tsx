import { Project } from "@/types";
import { Badge } from "../ui/badge";

export default function ProjectTags({ project }: { project: Project }) {
  return project.tags?.length ? (
    <div className="mt-3 md:mt-4">
      <div className="flex flex-wrap gap-1 md:gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px] md:text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  ) : null;
}