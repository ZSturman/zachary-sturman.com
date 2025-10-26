import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollectionItem, Project } from "@/types";
import { getCategory } from "@/lib/utils";
import CollectionItemCard from "./collection-item";

interface CollectionProps {
  project: Project;
  inModal?: boolean;
}

export function Collection({ project, inModal }: CollectionProps) {
  


  const items: CollectionItem[] = (project.collection?.items ??
    []) as CollectionItem[];

  if (!items || items.length === 0) {
    return null;
  }

  // Group items by inferred category
  const groups = items.reduce<Record<string, CollectionItem[]>>((acc, it) => {
    const path = (it as unknown as { path?: string }).path;
    const cat = getCategory(
      it.type,
      path || (it.thumbnail as string) || it.label
    );
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(it);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups);

  // If no items, show empty card
  if (groupKeys.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No items in this collection
          </p>
        </CardContent>
      </Card>
    );
  }

  
  if (groupKeys.length === 1) {
    // Single group -> render items directly
    return (
      <div className="space-y-4">
        {groups[groupKeys[0]].map((item, idx) => {
          return (
            <div key={idx} className="grid gap-4  items-start">
              <div className="mt-4">
                  <CollectionItemCard item={item} project={project} inModal={inModal} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Multiple groups -> render tabs per category
  return (
    <Tabs defaultValue={groupKeys[0]} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        {groupKeys.map((key) => (
          <TabsTrigger key={key} value={key}>
            {key}
          </TabsTrigger>
        ))}
      </TabsList>

      {groupKeys.map((key) => (
        <TabsContent key={key} value={key} className="space-y-4">
          {groups[key].map((item, idx) => {
            return (
              <div key={idx} className="grid gap-4  items-start">
                <div className="mt-4">
                    <CollectionItemCard item={item} project={project} inModal={inModal} />
                </div>
              </div>
            );
          })}
        </TabsContent>
      ))}
    </Tabs>
  );
}
