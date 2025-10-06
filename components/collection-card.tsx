"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import type { Project } from "@/types"

interface CollectionCardProps {
  project: Project
  onClick?: () => void
}

export function CollectionCard({ project, onClick }: CollectionCardProps) {
  // project is expected to have type: 'collection' and a `collection.items` array
  const maybe = project as unknown as Record<string, unknown>
  const col = (maybe.collection as unknown as Record<string, unknown> | undefined) ?? undefined
  const items = Array.isArray(col?.items) ? (col!.items as Record<string, unknown>[]) : []

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={onClick}>
      <h3 className="text-lg font-semibold mb-3">{project.title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((it, i) => {
          const label = typeof it.label === "string" ? it.label : (typeof it.id === "string" ? it.id : `Item ${i + 1}`)
          const thumb = typeof it.thumbnail === "string" ? it.thumbnail : "/placeholder.svg"
          const key = (typeof it.id === "string" ? it.id : String(i))
          return (
            <div key={key + i} className="flex flex-col items-center text-center">
              <div className="relative w-full pb-[100%] rounded overflow-hidden bg-muted">
                <Image
                  src={thumb}
                  alt={label}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-sm mt-2 line-clamp-2">{label}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
