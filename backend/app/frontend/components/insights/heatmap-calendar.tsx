import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

  // Get intensity class based on count
  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/10 border border-border/20"
    const ratio = count / maxCount
    if (ratio >= 0.75) return "bg-accent-primary border border-accent-primary"
    if (ratio >= 0.5) return "bg-accent-primary/70 border border-accent-primary/70"
    if (ratio >= 0.25) return "bg-accent-primary/40 border border-accent-primary/40"
    return "bg-accent-primary/20 border border-accent-primary/20"
  }

  // Calculate date range - always show last 60 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 59) // 60 days total including today

  // Find the start of the week (Sunday) for startDate
  const gridStartDate = new Date(startDate)
  gridStartDate.setDate(gridStartDate.getDate() - gridStartDate.getDay())

  // Find the end of the week (Saturday) for endDate
  const gridEndDate = new Date(endDate)
  gridEndDate.setDate(gridEndDate.getDate() + (6 - gridEndDate.getDay()))

  // Calculate number of days and weeks
  const totalDays = Math.ceil((gridEndDate.getTime() - gridStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const numWeeks = Math.ceil(totalDays / 7)

  // Create a 2D grid: grid[dayOfWeek][weekIndex] = Date | null
  // dayOfWeek: 0 = Sunday, 6 = Saturday
  const grid: (Date | null)[][] = Array.from({ length: 7 }, () => Array<Date | null>(numWeeks).fill(null))

  // Fill the grid with dates
  const currentDate = new Date(gridStartDate)
  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 6 = Saturday
    const weekIndex = Math.floor(i / 7)
    grid[dayOfWeek][weekIndex] = new Date(currentDate)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Daily activity over the last 60 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            {/* Day labels on the left */}
            <div className="flex flex-col gap-[2px] pt-4">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className="flex h-8 w-18 items-center text-[11px] text-muted-foreground"
                >
                  {index % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex-1">
              <div className="space-y-[2px]">
                {grid.map((dayRow, dayIndex) => (
                  <div key={dayIndex} className="flex gap-[2px]">
                    {dayRow.map((date, weekIndex) => {
                      if (!date) {
                        return <div key={weekIndex} className="h-8 w-8" />
                      }

                      const dateStr = date.toISOString().split("T")[0]
                      const count = dataByDate.get(dateStr) ?? 0
                      const isInRange = date >= startDate && date <= endDate

                      return (
                        <TooltipProvider key={weekIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => isInRange && onDateClick?.(dateStr)}
                                className={`h-8 w-8 rounded transition-all ${
                                  isInRange
                                    ? getIntensityClass(count)
                                    : "bg-transparent"
                                } ${isInRange ? "cursor-pointer hover:ring-1 hover:ring-accent-primary/50" : "cursor-default"}`}
                                disabled={!isInRange}
                              />
                            </TooltipTrigger>
                            {isInRange && (
                              <TooltipContent>
                                <p className="font-medium">
                                  {date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-sm">
                                  {count} {count === 1 ? "entry" : "entries"}
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-xs bg-muted/10 border border-border/20" />
                  <div className="h-3 w-3 rounded-xs bg-accent-primary/20 border border-accent-primary/20" />
                  <div className="h-3 w-3 rounded-xs bg-accent-primary/40 border border-accent-primary/40" />
                  <div className="h-3 w-3 rounded-xs bg-accent-primary/70 border border-accent-primary/70" />
                  <div className="h-3 w-3 rounded-xs bg-accent-primary border border-accent-primary" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
