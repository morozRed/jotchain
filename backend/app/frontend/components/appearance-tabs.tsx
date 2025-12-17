import { Sun } from "lucide-react"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

// JotChain uses light mode only - this component shows the current (only) theme
export default function AppearanceToggleTab({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-lg bg-subtle p-1",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex items-center rounded-md px-3.5 py-1.5",
          "bg-surface shadow-sm text-foreground",
        )}
      >
        <Sun className="-ml-1 h-4 w-4" />
        <span className="ml-1.5 text-sm">Light</span>
      </div>
    </div>
  )
}
