import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ActivityDataPoint } from "@/types"

interface HeatmapCalendarProps {
  data: ActivityDataPoint[]
  onDateClick?: (date: string) => void
}

export function HeatmapCalendar({ data, onDateClick }: HeatmapCalendarProps) {
  // Find max count for color scaling
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  // Group data by date
  const dataByDate = new Map(data.map((d) => [d.date, d.count]))

  // Calculate date range - always show last 60 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 59) // 60 days total including today

  // Generate array of dates
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Get intensity class based on count
  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/30 border-border/30"
    const ratio = count / maxCount
    if (ratio >= 0.75)
      return "bg-gradient-to-t from-accent-primary via-accent-primary/90 to-accent-primary/80 border-accent-primary/50 shadow-md shadow-accent-primary/20"
    if (ratio >= 0.5)
      return "bg-gradient-to-t from-accent-primary/80 via-accent-primary/70 to-accent-primary/60 border-accent-primary/40 shadow-sm shadow-accent-primary/15"
    if (ratio >= 0.25)
      return "bg-gradient-to-t from-accent-primary/50 via-accent-primary/40 to-accent-primary/30 border-accent-primary/30"
    return "bg-gradient-to-t from-accent-primary/25 via-accent-primary/20 to-accent-primary/15 border-accent-primary/20"
  }

  const todayStr = endDate.toISOString().split("T")[0]

  return (
    <TooltipProvider delayDuration={80}>
      <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl dark:bg-card/80">
        {/* Decorative gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-secondary/5 opacity-50" />

        <CardHeader className="relative z-10 space-y-1">
          <CardTitle className="text-lg font-semibold">Activity Overview</CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            Daily activity over the last 60 days
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            {/* Horizontal bar chart */}
            <div className="flex h-16 gap-0.5 overflow-hidden rounded-lg p-4">
              {dates.map((date) => {
                const dateStr = date.toISOString().split("T")[0]
                const count = dataByDate.get(dateStr) ?? 0
                const isToday = dateStr === todayStr
                const height = count > 0 ? Math.max((count / maxCount) * 100, 12) : 6

                return (
                  <Tooltip key={dateStr}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onDateClick?.(dateStr)}
                        className={cn(
                          "flex-1 min-w-[2px] rounded-sm border transition-all duration-200 ease-out",
                          "hover:scale-y-125 hover:z-10 hover:ring-1 hover:ring-accent-primary/50",
                          getIntensityClass(count),
                          isToday && "ring-2 ring-accent-primary/60 ring-offset-1 ring-offset-background"
                        )}
                        style={{
                          height: `${height}%`,
                          alignSelf: "flex-end",
                        }}
                        onMouseEnter={(e) => {
                          if (count > 0) {
                            e.currentTarget.style.filter = `drop-shadow(0 0 8px rgba(129, 140, 248, 0.6))`
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = "none"
                        }}
                      >
                        <span className="sr-only">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: {count}{" "}
                          {count === 1 ? "entry" : "entries"}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-card/95 backdrop-blur-sm">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">
                          {date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {count} {count === 1 ? "entry" : "entries"}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>

            {/* Legend and date range */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground/70">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-sm border border-border/40 bg-muted/30" />
                  <div className="h-3 w-3 rounded-sm border border-accent-primary/20 bg-gradient-to-t from-accent-primary/15 to-accent-primary/25" />
                  <div className="h-3 w-3 rounded-sm border border-accent-primary/30 bg-gradient-to-t from-accent-primary/30 to-accent-primary/40" />
                  <div className="h-3 w-3 rounded-sm border border-accent-primary/40 bg-gradient-to-t from-accent-primary/60 to-accent-primary/70 shadow-sm shadow-accent-primary/15" />
                  <div className="h-3 w-3 rounded-sm border border-accent-primary/50 bg-gradient-to-t from-accent-primary via-accent-primary/90 to-accent-primary/80 shadow-md shadow-accent-primary/20" />
                </div>
                <span>More</span>
              </div>
              <div className="text-muted-foreground/70">
                {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
