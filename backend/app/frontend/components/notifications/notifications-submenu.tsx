import { Link, usePage } from "@inertiajs/react"
import type { PropsWithChildren } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { notificationsPath } from "@/routes"

export default function NotificationsSubmenu({ children }: PropsWithChildren) {
  const { url } = usePage()
  const isHistory = url.includes("/notifications/history")
  const isSettings = !isHistory

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav className="flex flex-col space-y-1 space-x-0">
            <Button
              size="sm"
              variant="ghost"
              asChild
              className={cn("w-full justify-start", {
                "bg-muted": isSettings,
              })}
            >
              <Link href={notificationsPath()} prefetch>
                Settings
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              asChild
              className={cn("w-full justify-start", {
                "bg-muted": isHistory,
              })}
            >
              <Link href={`${notificationsPath()}/history`} prefetch>
                History
              </Link>
            </Button>
          </nav>
        </aside>

        <div className="flex-1 md:max-w-4xl">{children}</div>
      </div>
    </div>
  )
}

