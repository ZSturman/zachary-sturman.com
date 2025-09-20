import type { ResourceType } from "@/types";


// lib/resourceMap.ts
export const RESOURCE_LABEL: Record<string, string> = {
  "github": "GitHub",
  "gitlab": "GitLab",
  "overleaf": "Overleaf",
  "gdoc": "Google Doc",
  "gslide": "Google Slides",
  "pdf": "PDF",
  "markdown": "Markdown",
  "video": "Video",
  "audio": "Audio",
  "image": "Image",
  "dataset": "Dataset",
  "download": "Download",
  "website": "Website",
  "blog": "Blog"
};



// Map resource and medium keys to svg file basenames placed under /public/icons/
// Example: key "github" -> /icons/github.svg
const ICON_MAP: Record<ResourceType | string, string> = {
  github: "github",
  gitlab: "gitlab",
  overleaf: "overleaf",
  gdoc: "googledocs",
  gslide: "googleslides",
  pdf: "pdf",
  markdown: "markdown",
  video: "video",
  audio: "audio",
  image: "image",
  dataset: "dataset",
  download: "download",
  website: "website",
  blog: "blog",
  // mediums (legacy, for compatibility)
  code: "code",
  science: "science",
  game: "game",
  film: "film",
  tv: "tv",
  novel: "novel",
  poetry: "poetry",
  music: "music",
  art: "art",
  other: "other",
  // fallback
  placeholder: "placeholder",
  default: "default"
};

export function hasIcon(key: string): boolean {
  const k = (key || "").toLowerCase();
  return Object.prototype.hasOwnProperty.call(ICON_MAP, k);
}

export function iconPath(key: string): string | null {
  const k = (key || "").toLowerCase();
  const name = ICON_MAP[k];
  if (!name) return null;
  return `/icons/${name}.svg`;
}

export function bestIconPath(resourceType?: ResourceType | string, medium?: string): string {
  return (
    iconPath(resourceType || "") ||
    iconPath(medium || "") ||
    iconPath("placeholder")!
  );
}




export const MEDIUM_LABEL: Record<string, string> = {
  code: "Code",
  science: "Science",
  game: "Game",
  film: "Film",
  tv: "TV",
  novel: "Novel",
  poetry: "Poetry",
  music: "Music",
  art: "Art",
  other: "Other"
};

export const STATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  draft: "Draft",
  prototype: "Prototype",
  finished: "Finished",
  released: "Released",
  archived: "Archived"
};

export const STATUS_COLOR: Record<string, string> = {
  idea: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  prototype: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  finished: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  released: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};