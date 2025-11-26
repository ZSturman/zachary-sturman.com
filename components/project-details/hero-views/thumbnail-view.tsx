import { Project } from "@/types";
import { MediaDisplay } from "@/components/ui/media-display";
import ResourceButtons from "../resource-buttons";
import { formatTextWithNewlines } from "@/lib/utils";

export default function ThumbnailView({
  project,
  image,
}: {
  project: Project;
  image: string;
}) {
  // Get video settings for thumbnail
  const thumbnailSettings = project.imageSettings?.thumbnail;
  
  return (
    <div>
      <div className="w-full flex flex-row justify-start gap-2">
        <div className="relative min-w-1/4 max-w-1/2 mx-auto aspect-square rounded-lg h-full">
          <MediaDisplay
            src={image || "/placeholder.svg"}
            alt={project.title}
            fill
            className="w-full h-auto py-auto pt-2 rounded-lg object-contain"
            loop={thumbnailSettings?.loop ?? true}
            autoPlay={thumbnailSettings?.autoPlay ?? true}
          />
        </div>

        <div className="space-y-4 w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-balance">
            {project.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto whitespace-pre-wrap">
            {formatTextWithNewlines(project.summary)}
          </p>
        </div>
      </div>

      <ResourceButtons project={project} showMessage={false} />
    </div>
  );
}