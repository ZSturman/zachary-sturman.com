import { Project } from "@/types";
import Image from "next/image";
import ResourceButtons from "../resource-buttons";

export default function ThumbnailView({
  project,
  image,
}: {
  project: Project;
  image: string;
}) {
  return (
    <div>
      <div className="w-full flex flex-row justify-start gap-2">
        <div className="relative min-w-1/4 max-w-1/2 mx-auto aspect-square rounded-lg h-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={project.title}
            fill
            className="w-full h-auto py-auto pt-2 rounded-lg object-contain"
          />
        </div>

        <div className="space-y-4 w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-balance">
            {project.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            {project.summary}
          </p>
        </div>
      </div>

      <ResourceButtons project={project} showMessage={false} />
    </div>
  );
}