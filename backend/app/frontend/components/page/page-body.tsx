import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

type PageBodyProps = PropsWithChildren<{
  className?: string
  contentClassName?: string
}>

export function PageBody({
  children,
  className,
  contentClassName,
}: PageBodyProps) {
  return (
    <div className={cn("px-4 pb-10 pt-6 md:px-6", className)}>
      <div className={cn("flex w-full flex-col gap-6", contentClassName)}>
        {children}
      </div>
    </div>
  )
}

