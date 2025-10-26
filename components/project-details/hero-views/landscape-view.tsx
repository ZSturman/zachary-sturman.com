import { Project } from "@/types";
import Image from "next/image";
import ResourceButtons from "../resource-buttons";

export default function LandscapeView({
  project,
  image,
}: {
  project: Project;
  image: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col w-full">
          <h1 className="text-4xl md:text-5xl lg:text-8xl font-light tracking-tight text-balance">
            {project.title}
          </h1>

          {project.subtitle && (
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-balance">
              {project.subtitle}
            </h1>
          )}
        </div>

        <div className="flex flex-col justify-end">
          <ResourceButtons project={project} showMessage={false} />
        </div>

        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
          {project.summary}
        </p>
      </div>
      <div className="relative w-full aspect-[2/1] overflow-hidden rounded-lg ">
        <Image
          src={image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
