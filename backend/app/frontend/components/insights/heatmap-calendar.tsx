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
    if (count === 0) return "bg-muted/20 hover:bg-muted/30"
    const ratio = count / maxCount
    if (ratio >= 0.75) return "bg-accent-primary hover:opacity-90"
    if (ratio >= 0.5) return "bg-accent-primary/70 hover:bg-accent-primary/80"
    if (ratio >= 0.25) return "bg-accent-primary/40 hover:bg-accent-primary/50"
    return "bg-accent-primary/20 hover:bg-accent-primary/30"
  }

  // Create calendar grid
  const startDate = data.length > 0 ? new Date(data[0].date) : new Date()
  const endDate = data.length > 0 ? new Date(data[data.length - 1].date) : new Date()

  // Get all dates in range
  const allDates: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    allDates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Group dates by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Add padding for first week
  const firstDayOfWeek = allDates[0].getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    const paddingDate = new Date(allDates[0])
    paddingDate.setDate(paddingDate.getDate() - (firstDayOfWeek - i))
    currentWeek.push(paddingDate)
  }

  allDates.forEach((date, index) => {
    currentWeek.push(date)
    if (date.getDay() === 6 || index === allDates.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Daily activity intensity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="mb-2 flex gap-2 text-xs text-muted-foreground">
              {weekDays.map((day) => (
                <div key={day} className="w-8 text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-1">
                  {week.map((date, dayIndex) => {
                    const dateStr = date.toISOString().split("T")[0]
                    const count = dataByDate.get(dateStr) ?? 0
                    const isInRange = date >= startDate && date <= endDate

                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => isInRange && onDateClick?.(dateStr)}
                              className={`h-8 w-8 rounded transition-all ${
                                isInRange ? getIntensityClass(count) : "bg-transparent"
                              } ${isInRange ? "cursor-pointer" : "cursor-default"}`}
                              disabled={!isInRange}
                            />
                          </TooltipTrigger>
                          {isInRange && (
                            <TooltipContent>
                              <p className="font-medium">{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
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
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded bg-muted/20" />
                <div className="h-3 w-3 rounded bg-accent-primary/20" />
                <div className="h-3 w-3 rounded bg-accent-primary/40" />
                <div className="h-3 w-3 rounded bg-accent-primary/70" />
                <div className="h-3 w-3 rounded bg-accent-primary" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
