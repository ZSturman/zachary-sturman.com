import { Project } from "@/types";

export default function NoImageHeroImage({ project }: { project: Project }) {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-balance">
          {project.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
          {project.summary}
        </p>
      </div>
    </div>
  );
}
