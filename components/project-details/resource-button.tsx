import { Resource } from "@/types";
import { Button } from "../ui/button";
import { bestIconPath } from "@/lib/resource-map";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ResourceButton({
  resource,
  className,
  iconOnly = false,
  showLabelOnMd = false,
}: {
  resource: Resource;
  className?: string;
  iconOnly?: boolean;
  showLabelOnMd?: boolean;
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
  
  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className || "h-10 w-10 shrink-0"}
        onClick={handleClick}
        title={resource.label}
      >
        <Image
          className="dark:invert"
          src={icon}
          alt={resource.type}
          width={20}
          height={20}
        />
      </Button>
    );
  }
  
  // Show icon only on mobile, with label on md+ screens
  if (showLabelOnMd) {
    return (
      <Button
        variant="ghost"
        className={className || "h-8 w-8 md:h-auto md:w-auto md:px-3 md:py-1.5 shrink-0"}
        onClick={handleClick}
        title={resource.label}
      >
        <Image
          className="dark:invert shrink-0"
          src={icon}
          alt={resource.type}
          width={16}
          height={16}
        />
        <span className="hidden md:inline ml-1.5 text-xs font-medium truncate max-w-[120px]">
          {resource.label}
        </span>
      </Button>
    );
  }
  
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
