import * as fs from "fs";
import * as path from "path";

/**
 * Recursively loads all .json files under /public/<subdir>
 * and returns a single typed array.
 * Files may contain a single object or an array.
 */
export async function loadPublicJsonRecursively<T = unknown>(
  subdir = "projects"
): Promise<T[]> {
  const root = path.join(process.cwd(), "public", subdir);
  const out: T[] = [];

  async function walk(dir: string) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name.endsWith(".json")) {
        try {
          const raw = await fs.promises.readFile(full, "utf8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) out.push(...(parsed as T[]));
          else out.push(parsed as T);
        } catch (err) {
          console.error(`Skipping ${full}:`, err);
        }
      }
    }
  }

  await walk(root);
  return out;
}
