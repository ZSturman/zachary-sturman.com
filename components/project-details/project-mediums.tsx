import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import React from "react";


export default  function ProjectMediums({ project }: { project: Project }) {
  const mediums = Array.isArray(project.mediums) ? project.mediums : [];

  return mediums.length > 0 ? (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {mediums.map((m) => (
          <Badge key={String(m)} variant="outline">
            {m}
          </Badge>
        ))}
      </div>
    </div>
  ) : null;
}

