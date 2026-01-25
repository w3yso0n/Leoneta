"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Skeleton className="h-8 w-52" />

      <Card className="p-4 sm:p-6 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/2" />
      </Card>

      <Card className="p-4 sm:p-5 space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </Card>
    </div>
  )
}
