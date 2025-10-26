export type ResourceType = string;

export interface Resource {
  id?: string;
  type: ResourceType;
  label: string;
  url: string;
}

export type CollectionItemType =
  | "image"
  | "video"
  | "3d-model"
  | "game"
  | "text"
  | "audio"
  | "url-link";

export type CollectionItem = {
  id: string;
  path: string;
  label?: string;
  summary?: string;
  thumbnail?: string;
  resources?: Resource[]; // optional in JSON
  type: CollectionItemType;
  loop?: boolean;
  autoPlay?: boolean;
};

export interface Project {
  id: string;
  domain: string;
  category?: string;
  mediums?: string[];
  status: string;
  subStatus?: string;          // fixed casing
  title: string;
  summary: string;
  description?: string;
  story?: string;
  images?: {
    directory?: string;
    banner?: string;
    iconCircle?: string;
    iconSquare?: string;
    posterLandscape?: string;
    posterPortrait?: string;
    thumbnail?: string;
    [k: string]: string | undefined;
  };
  thumbnail?: string;          // top-level thumbnail seen in JSON
  visibility: string;          // required in JSON
  starred?: boolean;
  tags?: string[];
  resources?: Resource[];
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
  reviewed?: string;           // ISO 8601, optional
  metadata?: Record<string, unknown>;
  subtitle?: string;
  genres?: string[];
  topics?: string[];
  details?: Array<{ label: string; value: string }>;
  collection?: {
    items?: CollectionItem[];
    thumbnails?: string;       // e.g., "_collection_thumbnails"
    updatedAt?: string;        // ISO 8601
  };
  requiresFollowUp?: boolean;
}