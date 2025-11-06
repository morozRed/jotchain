import { useEffect, useState } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Project {
  id: number
  name: string
}

interface FilterBarProps {
  projects: Project[]
  selectedProject: string | null
  selectedRange: "week" | "month" | "year"
  onProjectChange: (projectId: string | null) => void
  onRangeChange: (range: "week" | "month" | "year") => void
}

export function FilterBar({
  projects,
  selectedProject,
  selectedRange,
  onProjectChange,
  onRangeChange,
}: FilterBarProps) {
  const [timezone, setTimezone] = useState<string>("")

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  return (
    <div className="rounded-2xl border border-border/40 bg-background/60 p-4 shadow-[0_24px_80px_-48px_rgba(8,15,30,0.65)] backdrop-blur">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
        <span>Filters</span>
        {timezone && <span className="hidden sm:inline">Local time • {timezone}</span>}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <Select
            value={selectedProject?.toString() ?? "all"}
            onValueChange={(value) => onProjectChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border border-border/40 bg-card/80 text-sm font-medium text-foreground shadow-inner shadow-black/5 transition-all duration-200 focus:ring-2 focus:ring-accent-primary/40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-sm">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedRange} onValueChange={(value) => onRangeChange(value as "week" | "month" | "year")}>
          <TabsList className="flex w-full gap-2 rounded-xl bg-background/80 p-1 sm:w-auto">
            {[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value as "week" | "month" | "year"}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
