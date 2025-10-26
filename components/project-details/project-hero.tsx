import { Project } from "@/types";
import React from "react";
import ThumbnailView from "./hero-views/thumbnail-view";
import PortraitView from "./hero-views/portrait-view";
import LandscapeView from "./hero-views/landscape-view";
import NoImageHeroImage from "./hero-views/no-image-view";

const ProjectHero = ({ project }: { project: Project }) => {
  const srcLandscape =
    project.images &&
    typeof project.images.posterLandscape === "string" &&
    project.images.posterLandscape
      ? `/projects/${project.id}/${project.images.posterLandscape}`
      : null;

  const srcPortait =
    project.images &&
    typeof project.images.posterPortait === "string" &&
    project.images.posterPortait
      ? `/projects/${project.id}/${project.images.posterPortait}`
      : null;

  const srcThumb =
    project.images &&
    typeof project.images.thumbnail === "string" &&
    project.images.thumbnail
      ? `/projects/${project.id}/${project.images.thumbnail}`
      : null;

  const image = srcLandscape
    ? srcLandscape
    : srcPortait
    ? srcPortait
    : srcThumb;

  if (!image) {
    return <NoImageHeroImage project={project} />;
  }

  if (srcLandscape) {
    return <LandscapeView project={project} image={image} />;
  } else if (srcPortait) {
    return <PortraitView project={project} image={image} />;
  } else {
    return <ThumbnailView project={project} image={image} />;
  }
};

export default ProjectHero;
