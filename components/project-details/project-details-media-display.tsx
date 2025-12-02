import { getOptimizedMediaPath } from "@/lib/utils";
import { Project } from "@/types";
import React from "react";
import { MediaDisplay } from "../ui/media-display";

interface ProjectDetailsMediaDisplayProps {
  project: Project;
}

const ProjectDetailsMediaDisplay = ({ project }: ProjectDetailsMediaDisplayProps) => {
  const folderName = project.folderName || project.id;
  const folderPath = `/projects/${folderName}`;

  const poster =
    project.images?.posterPortrait ||
    project.images?.posterLandscape ||
    project.images?.poster;
  const posterOrientation = project.images?.posterPortrait
    ? "portrait"
    : "landscape";

  const posterPath = getOptimizedMediaPath(poster, folderPath);
  const thumbnailPath = getOptimizedMediaPath(
    project.images?.thumbnail,
    folderPath
  );

  // Get video settings for poster and thumbnail
  const posterSettings = poster
    ? project.images?.posterPortrait
      ? project.imageSettings?.posterPortrait
      : project.images?.posterLandscape
      ? project.imageSettings?.posterLandscape
      : project.imageSettings?.poster
    : undefined;

  const thumbnailSettings = project.imageSettings?.thumbnail;

  return (
    <div className="bg-red-200 min-w-20 min-h-20">
      {poster && (
        <div className="overflow-hidden rounded-lg  relative">
          <MediaDisplay
            src={posterPath}
            alt={`${project.title} poster`}
            width={400}
            height={posterOrientation === "portrait" ? 600 : 225}
            className={`w-full h-auto object-cover`}
            loop={posterSettings?.loop ?? true}
            autoPlay={posterSettings?.autoPlay ?? true}
          />
        </div>
      )}

      {project.images?.thumbnail && !poster && (
        <div className="overflow-hidden rounded-lg relative">
          <MediaDisplay
            src={thumbnailPath}
            alt={`${project.title} thumbnail`}
            fill
            className="w-full object-cover aspect-video"
            loop={thumbnailSettings?.loop ?? true}
            autoPlay={thumbnailSettings?.autoPlay ?? true}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsMediaDisplay;
