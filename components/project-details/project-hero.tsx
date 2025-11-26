import { Project } from "@/types";
import React from "react";
import ThumbnailView from "./hero-views/thumbnail-view";
import PortraitView from "./hero-views/portrait-view";
import LandscapeView from "./hero-views/landscape-view";
import NoImageHeroImage from "./hero-views/no-image-view";
import { getOptimizedMediaPath } from "@/lib/utils";

const ProjectHero = ({ project }: { project: Project }) => {
  const folderName = project.folderName || project.id;
  const folderPath = `/projects/${folderName}`;

  const srcBanner = project.images?.banner ? getOptimizedMediaPath(project.images.banner, folderPath) : null;
  const srcPoster = project.images?.poster ? getOptimizedMediaPath(project.images.poster, folderPath) : null;
  const srcThumb = project.images?.thumbnail ? getOptimizedMediaPath(project.images.thumbnail, folderPath) : null;

  // Prefer banner, then poster, then thumbnail
  const media = srcBanner || srcPoster || srcThumb;

  if (!media) {
    return <NoImageHeroImage project={project} />;
  }

  // Use banner as landscape view
  if (srcBanner) {
    return <LandscapeView project={project} image={media} />;
  } else if (srcPoster) {
    return <PortraitView project={project} image={media} />;
  } else {
    return <ThumbnailView project={project} image={media} />;
  }
};

export default ProjectHero;
