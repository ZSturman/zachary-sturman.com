import { MediaDisplay } from "@/components/ui/media-display";
import ResourceButtons from "../resource-buttons";
import { Project } from "@/types";
import { formatTextWithNewlines } from "@/lib/utils";

export default function PortraitView({ project, image }: { project: Project; image: string }) {
  // Get video settings for poster
  const posterSettings = project.images?.posterPortrait 
    ? project.imageSettings?.posterPortrait 
    : project.imageSettings?.poster;
  
  return (
    <div className="flex flex-row">
      <div className="relative w-full aspect-[9/13] overflow-hidden rounded-lg ">
        <MediaDisplay
          src={image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover"
          priority
          loop={posterSettings?.loop ?? true}
          autoPlay={posterSettings?.autoPlay ?? true}
        />
      </div>

      <div className="flex flex-col w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-balance">
          {project.title}
        </h1>

{project.subtitle && (
  
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-balance">
          {project.subtitle}
        </h1>
)}
        <div className="flex flex-col justify-end">
          <ResourceButtons project={project} showMessage={false} />
        </div>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty whitespace-pre-wrap">
          {formatTextWithNewlines(project.summary)}
        </p>
      </div>
    </div>
  );
}