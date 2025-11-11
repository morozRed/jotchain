import { Link, usePage } from "@inertiajs/react"
import { History, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { historyInsightsPath, insightsPath } from "@/routes"

export default function InsightsSubmenu() {
  const { url } = usePage()

  const tabs = [
    {
      href: insightsPath(),
      label: "Generate",
      icon: Sparkles,
      active: url === insightsPath(),
    },
    {
      href: historyInsightsPath(),
      label: "History",
      icon: History,
      active: url.startsWith(historyInsightsPath()),
    },
  ]

  return (
    <div className="border-b">
      <nav className="flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab.active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
