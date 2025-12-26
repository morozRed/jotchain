import { Link, usePage } from "@inertiajs/react"
import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"
import {
  settingsAppearancePath,
  settingsEmailPath,
  settingsEntitiesPath,
  settingsPasswordPath,
  settingsProfilePath,
  settingsSessionsPath,
} from "@/routes"

const sidebarNavItems = [
  { title: "Profile", href: settingsProfilePath() },
  { title: "Email", href: settingsEmailPath() },
  { title: "Password", href: settingsPasswordPath() },
  { title: "Sessions", href: settingsSessionsPath() },
  { title: "Projects & People", href: settingsEntitiesPath() },
  { title: "Appearance", href: settingsAppearancePath() },
]

export default function SettingsLayout({ children }: PropsWithChildren) {
  const { url } = usePage()

  return (
    <div className="mx-auto flex w-full max-w-4xl gap-0 px-6 py-8 lg:px-12">
      {/* Left sidebar navigation */}
      <aside className="w-40 shrink-0 pr-8 lg:pr-12">
        <h1 className="mb-6 text-[13px] font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <nav className="flex flex-col gap-0.5">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                url === item.href
                  ? "bg-subtle font-medium text-foreground"
                  : "text-muted-foreground hover:bg-subtle hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        <div className="max-w-lg">{children}</div>
      </main>
    </div>
  )
}
