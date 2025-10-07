"use client"

import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md text-pretty">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
