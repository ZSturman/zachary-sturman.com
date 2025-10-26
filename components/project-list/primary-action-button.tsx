"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import ResourceButton from "../project-details/resource-button";
import { useRouter } from "next/navigation";
import type { Project, Resource } from "@/types";

export default function PrimaryActionButton({
  project,
  resource,
  className,
}: {
  project: Project;
  resource?: Resource;
  className?: string;
}) {
  const router = useRouter();

  if (resource) {
    return <ResourceButton resource={resource} />;
  }

  return (
    <Button
      variant="outline"
      className={className || "justify-start gap-3 h-auto p-2 px-4 bg-transparent w-auto max-w-64 hover:cursor-pointer"}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/projects/${project.id}`);
      }}
    >
      <Image
        className="dark:invert shrink-0"
        src="/icons/file.svg"
        alt="Details"
        width={20}
        height={20}
      />
      <div className="text-left truncate">
        <div className="font-medium truncate">More Details</div>
        <div className="text-xs text-muted-foreground break-all truncate">{`/projects/${project.id}`}</div>
      </div>
    </Button>
  );
}
