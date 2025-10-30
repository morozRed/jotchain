import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
  iconClassName?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-primary/40 bg-background/40 p-4 text-left",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary",
            iconClassName,
          )}
        >
          {icon}
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}

