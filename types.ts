export type ResourceType =
  | "github"
  | "gitlab"
  | "overleaf"
  | "gdoc"
  | "gslide"
  | "pdf"
  | "markdown"
  | "video"
  | "audio"
  | "image"
  | "dataset"
  | "download"
  | "website"
  | "blog";

export interface Resource {
  type: ResourceType;
  label: string;
  url: string;
}

// -------------------- Core discriminants --------------------
export type Domain = "Technology" | "Creative" | "Expository" 
export type Visibility = "private" | "unlisted" | "public" | "restricted";

// -------------------- Status models --------------------
type CommonStatus = "idea" | "in_progress" | "on_hold" | "cancelled" | "archived" | "completed";

export type TechStatus =
  | CommonStatus
  | "prototype"
  | "alpha"
  | "beta"
  | "early_access"
  | "released_stable"
  | "maintenance"
  | "deprecated"
  | "end_of_life";

export type CreativeStatus =
  | CommonStatus
  | "draft"
  | "editing"
  | "in_review"
  | "released_preview"
  | "published_provisional"
  | "released"
  | "definitive_edition";

export type ExpositoryStatus =
  | CommonStatus
  | "draft"
  | "submitted"
  | "preprint"
  | "under_review"
  | "published_provisional"
  | "final_published"
  | "living_document";

// -------------------- Taxonomy --------------------
export type TechCategory = "Software" | "Hardware" | "System";

export type SoftwareMedium =
  | "Mobile"
  | "Desktop"
  | "Web"
  | "CLI"
  | "API"
  | "Module"
  | "Library"
  | "AR"
  | "VR";

export type HardwareMedium =
  | "Microcontroller"
  | "SingleBoardComputer"
  | "FPGA"
  | "PCB"
  | "Sensor"
  | "Actuator"
  | "Robotics"
  | "Wearable"
  | "IoTDevice"
  | "EmbeddedAppliance";

export type SystemMedium = SoftwareMedium | HardwareMedium;

export type CreativeCategory = "Tiny" | "Short" | "Script" | "Game" | "Article" | "Other";

export type CreativeGenre =
  | "Comedy"
  | "Horror"
  | "Drama"
  | "SciFi"
  | "Fantasy"
  | "Thriller"
  | "Romance"
  | "Mystery"
  | "Nonfiction"
  | "Action"
  | "Adventure";

export type ScriptMedium =
  | "TV"
  | "Movie"
  | "Stage"
  | "Podcast"
  | "Radio"
  | "Animation"
  | "WebSeries"
  | "AudioDrama";

export type GameMedium = "Mobile" | "Web" | "Desktop" | "Board" | "AR" | "VR" | "Card" | "Console";

export type ExpositoryCategory = "Article" | "Essay" | "Research" | "Report" | "Tutorial" | "WhitePaper";

export type ExpositoryTopic =
  | "Biology"
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "ComputerScience"
  | "Engineering"
  | "Economics"
  | "History"
  | "Philosophy"
  | "Psychology"
  | "Sociology"
  | "PoliticalScience"
  | "Education"
  | "Law"
  | "Medicine"
  | "EnvironmentalScience"
  | "DataScience"
  | "Art"
  | "Literature";

// -------------------- Shared fields --------------------
interface BaseProject {
  id: string;
  domain: Domain;
  title: string;
  summary: string;
  thumbnail?: string;     // optional thumbnail
  visibility: Visibility;    // required visibility
  tags?: string[];
  resources: Resource[];     // required resources collection
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  metadata?: Record<string, unknown>; // extensibility
}

// -------------------- Domain payloads --------------------
export interface IdeaProject extends BaseProject {
  status: "idea";
  // no further structural params
}

interface TechnologyProjectBase extends BaseProject {
  domain: "Technology";
  category: TechCategory; // exactly one
  status: TechStatus;
}

export interface SoftwareProject extends TechnologyProjectBase {
  category: "Software";
  mediums: SoftwareMedium[]; // multiple allowed
}

export interface HardwareProject extends TechnologyProjectBase {
  category: "Hardware";
  mediums: HardwareMedium[]; // multiple allowed
}

export interface SystemProject extends TechnologyProjectBase {
  category: "System";
  mediums: SystemMedium[]; // multiple allowed
}

export type TechnologyProject = SoftwareProject | HardwareProject | SystemProject;

interface CreativeProjectBase extends BaseProject {
  domain: "Creative";
  category: CreativeCategory; // exactly one
  status: CreativeStatus;
  genres?: CreativeGenre[]; // multiple allowed
}

export interface CreativeTiny extends CreativeProjectBase {
  category: "Tiny";
  requiresIllustrations: true;
}
export interface CreativeShort extends CreativeProjectBase {
  category: "Short";
}
export interface CreativeScript extends CreativeProjectBase {
  category: "Script";
  scriptMediums: ScriptMedium[]; // multiple
}
export interface CreativeGame extends CreativeProjectBase {
  category: "Game";
  gameMediums: GameMedium[]; // multiple
}
export interface CreativeArticle extends CreativeProjectBase {
  category: "Article";
}
export interface CreativeOther extends CreativeProjectBase {
  category: "Other";
}

export type CreativeProject =
  | CreativeTiny
  | CreativeShort
  | CreativeScript
  | CreativeGame
  | CreativeArticle
  | CreativeOther;

export interface ExpositoryProject extends BaseProject {
  domain: "Expository";
  category: ExpositoryCategory; // exactly one
  status: ExpositoryStatus;
  topics?: ExpositoryTopic[]; // multiple
}

// -------------------- Final union --------------------
export type Project = IdeaProject | TechnologyProject | CreativeProject | ExpositoryProject;

// -------------------- Allowed statuses per domain --------------------
export const ALLOWED_STATUS: {
  Technology: readonly TechStatus[];
  Creative: readonly CreativeStatus[];
  Expository: readonly ExpositoryStatus[];
} = {
  Technology: [
    "idea",
    "in_progress",
    "on_hold",
    "cancelled",
    "prototype",
    "alpha",
    "beta",
    "early_access",
    "released_stable",
    "maintenance",
    "deprecated",
    "end_of_life",
    "completed",
    "archived",
  ] as const,
  Creative: [
    "idea",
    "in_progress",
    "on_hold",
    "cancelled",
    "draft",
    "editing",
    "in_review",
    "released_preview",
    "published_provisional",
    "released",
    "definitive_edition",
    "completed",
    "archived",
  ] as const,
  Expository: [
    "idea",
    "in_progress",
    "on_hold",
    "cancelled",
    "draft",
    "submitted",
    "preprint",
    "under_review",
    "published_provisional",
    "final_published",
    "living_document",
    "completed",
    "archived",
  ] as const,
};