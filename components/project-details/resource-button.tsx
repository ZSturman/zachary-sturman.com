import { Resource } from "@/types";
import { Button } from "../ui/button";
import { bestIconPath } from "@/lib/resource-map";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ResourceButton({
  resource,
  className,
}: {
  resource: Resource;
  className?: string;
}) {
  const router = useRouter();
  const icon = bestIconPath(resource.type);
  
  // Check if this is a folio resource (local project link)
  const isFolio = resource.type === "folio" || resource.type === "Folio" || resource.url.startsWith("/projects/");
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolio) {
      // Navigate to the local page without opening a new tab
      router.push(resource.url);
    } else {
      // Open external links in a new tab
      window.open(resource.url, "_blank", "noopener,noreferrer");
    }
  };
  
  return (
    <Button
      variant="outline"
      className={className || "justify-start gap-2 md:gap-3 h-auto p-2 md:px-4 px-3 bg-transparent w-auto max-w-full hover:cursor-pointer min-h-[44px]"}
      onClick={handleClick}
    >
      <Image
        className="dark:invert shrink-0"
        src={icon}
        alt={resource.type}
        width={16}
        height={16}
      />
      <div className="text-left truncate">
        <div className="font-medium truncate text-xs md:text-sm">{resource.label}</div>
        {/* {!isFolio && (
          <div className="text-[10px] md:text-xs text-muted-foreground break-all truncate">{resource.url}</div>
        )} */}
      </div>
    </Button>
  );
}
