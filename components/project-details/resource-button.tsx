import { Resource } from "@/types";
import { Button } from "../ui/button";
import { bestIconPath } from "@/lib/resource-map";
import Image from "next/image";

const handleLinkClick = (e: React.MouseEvent, url: string) => {
  e.stopPropagation();
  window.open(url, "_blank", "noopener,noreferrer");
};


export default function ResourceButton({
  resource,
}: {
  resource: Resource
}) {
  const icon = bestIconPath(resource.type);
  return (
    <Button
      variant="outline"
      className="justify-start gap-3 h-auto p-2 px-4 bg-transparent w-auto max-w-64 hover:cursor-pointer"
      onClick={(e) => handleLinkClick(e, resource.url)}
    >
      <Image
        className="dark:invert shrink-0"
        src={icon}
        alt={resource.type}
        width={20}
        height={20}
      />
      <div className="text-left truncate">
        <div className="font-medium truncate">{resource.label}</div>
        <div className="text-xs text-muted-foreground break-all truncate">{resource.url}</div>
      </div>
    </Button>
  );
}
