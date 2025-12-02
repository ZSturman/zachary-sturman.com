import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a file path is a video file based on its extension
 */
export function isVideoFile(path?: string | null): boolean {
  if (!path) return false
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  return ["mov", "mp4", "webm", "mkv", "avi", "flv", "ogv", "wmv", "mpg", "mpeg"].includes(ext)
}

/**
 * Check if a file path is an image file (including GIF) based on its extension
 */
export function isImageFile(path?: string | null): boolean {
  if (!path) return false
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  return ["png", "jpg", "jpeg", "svg", "gif", "webp", "bmp", "tiff", "heic", "avif"].includes(ext)
}

/**
 * Get the optimized media path for a given filename
 * Handles both images and videos, converting to optimized versions
 * @param filename - The original filename (e.g., "thumbnail.png", "video.mp4")
 * @param folderPath - The folder path (e.g., "/projects/my-project")
 * @returns The path to the optimized version
 */
export function getOptimizedMediaPath(filename: string | undefined, folderPath: string): string {
  if (!filename) return "/placeholder.svg"
  
  // If it's an external URL, return as-is
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename
  }
  
  const stem = filename.substring(0, filename.lastIndexOf('.')) || filename
  
  // Check if it's a video
  if (isVideoFile(filename)) {
    // Videos get optimized to .mp4
    return `${folderPath}/${stem}-optimized.mp4`
  }
  
  // Images (including GIFs) get optimized to .webp
  if (isImageFile(filename)) {
    return `${folderPath}/${stem}-optimized.webp`
  }
  
  // For other files, return as-is
  return `${folderPath}/${filename}`
}

export function getCategory(type?: string, path?: string) {
    const t = (type || "").toLowerCase()
    const ext = (path || "").split(".").pop()?.toLowerCase() ?? ""

    const is3d = ["glb", "gltf", "obj", "fbx", "stl"].includes(t) || ["glb", "gltf", "obj", "fbx", "stl"].includes(ext)
    if (is3d) return "3D Models"

    const isVideo = ["mov", "mp4", "webm", "mkv", "avi", "api"].includes(t) || ["mov", "mp4", "webm", "mkv", "avi"].includes(ext)
    if (isVideo) return "Videos"

    const isAudio = ["mp3", "wav", "aac", "ogg", "m4a"].includes(t) || ["mp3", "wav", "aac", "ogg", "m4a"].includes(ext)
    if (isAudio) return "Audio"

    const isImage = ["png", "jpg", "jpeg", "svg", "gif", "webp"].includes(t) || ["png", "jpg", "jpeg", "svg", "gif", "webp"].includes(ext)
    if (isImage) return "Images"

    const isText = ["pdf", "txt", "md", "doc", "docx", "epub"].includes(t) || ["pdf", "txt", "md", "doc", "docx", "epub"].includes(ext)
    if (isText) return "Documents"

    const isGame = ["unity", "unreal", "godot", "html5"].includes(t) || ["unity", "unreal", "godot", "html5"].includes(ext)
    if (isGame) return "Games"

    // fallback

    return "Other"
  }

/**
 * Format an ISO date string into a human-readable string.
 *
 * Usage examples:
 * - formatDate("2025-10-07") => "October 7, 2025" (default, en-US)
 * - formatDate("2025-10-07", "year") => "2025" (preset)
 * - formatDate("2025-10-07", "shortMonthYear") => "Oct 2025" (preset)
 * - formatDate("2025-10-07", "DD, MM, YYYY") => "07, 10, 2025" (pattern)
 * - formatDate("2025-10-07", "YY - MM") => "25 - 10" (pattern)
 * - formatDate("2025-10-07", { month: "short", year: "numeric" }) => "Oct 2025" (Intl options)
 * - formatDate("2025-10-07", (d) => d.toISOString()) => "2025-10-07T00:00:00.000Z" (custom function)
 *
 * The `formatter` parameter may be:
 * - an Intl.DateTimeFormatOptions object (recommended for locale-aware formatting),
 * - a function (date: Date) => string for complete control,
 * - a preset key: "year" | "shortMonthYear" | "long" | "iso",
 * - or a pattern string using tokens (DD, D, MM, M, MMM, MMMM, YYYY, YY).
 *
 * Pattern tokens:
 * - DD : day with leading zero (01..31)
 * - D  : day without leading zero (1..31)
 * - MM : month number with leading zero (01..12)
 * - M  : month number without leading zero (1..12)
 * - MMM : short month name (Jan..Dec)
 * - MMMM: full month name (January..December)
 * - YYYY: 4-digit year
 * - YY  : 2-digit year
 *
 * Examples:
 * - "DD/MM/YYYY" -> 07/10/2025
 * - "YY - MM"    -> 25 - 10
 * - "MMM YYYY"   -> Oct 2025
 *
 * The function returns the formatted string, or "N/A" when input is missing/invalid.
 */
export type DateFormatPreset = "year" | "shortMonthYear" | "long" | "iso"

export const formatDate = (
  s?: string,
  formatter?: Intl.DateTimeFormatOptions | ((date: Date) => string) | DateFormatPreset | string
): string | null => {
  if (!s) return null
  const date = new Date(s)
  if (isNaN(date.getTime())) return null

  // function formatter has highest precedence
  if (typeof formatter === "function") return formatter(date)

  // presets (string keys)
  if (typeof formatter === "string") {
    const preset = formatter as DateFormatPreset
    switch (preset) {
      case "year":
        return date.getFullYear().toString()
      case "shortMonthYear":
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      case "iso":
        return date.toISOString()
      case "long":
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    }

    // If not a preset, treat as a pattern string (tokens)
    const tokens: Record<string, string> = {
      DD: String(date.getDate()).padStart(2, "0"),
      D: String(date.getDate()),
      MM: String(date.getMonth() + 1).padStart(2, "0"),
      M: String(date.getMonth() + 1),
      YYYY: String(date.getFullYear()),
      YY: String(date.getFullYear()).slice(-2),
      MMM: date.toLocaleString("en-US", { month: "short" }),
      MMMM: date.toLocaleString("en-US", { month: "long" }),
    }

    // Replace token occurrences (prefer longer tokens first)
    const ordered = Object.keys(tokens).sort((a, b) => b.length - a.length)
    let out = formatter
    for (const t of ordered) {
      out = out.split(t).join(tokens[t])
    }
    return out
  }

  // Intl options (or default)
  return date.toLocaleDateString("en-US", (formatter as Intl.DateTimeFormatOptions) ?? { year: "numeric", month: "long", day: "numeric" })
}

/**
 * Format text to preserve newlines by converting `\n` to React nodes with `<br/>` elements.
 * Returns `null` for empty input, otherwise an array of React nodes.
 */
// (single implementation of formatTextWithNewlines is present above)

/**
 * Format text to preserve newlines by converting `\n` to React nodes with `<br/>` elements.
 * Returns `null` for empty input, otherwise an array of React nodes.
 */
export function formatTextWithNewlines(text?: string): React.ReactNode {
  if (!text) return null

  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []

  lines.forEach((line, i) => {
    nodes.push(line)
    if (i < lines.length - 1) {
      nodes.push(React.createElement("br", { key: `br-${i}` }))
    }
  })

  return nodes
}