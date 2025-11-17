import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
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

  // Generate array of dates and chart data
  const chartData: {
    date: string
    day: string
    shortDay: string
    month: string
    count: number
    fullDate: Date
  }[] = []

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    const count = dataByDate.get(dateStr) ?? 0
    chartData.push({
      date: dateStr,
      day: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      shortDay: currentDate.getDate().toString(),
      month: currentDate.toLocaleDateString("en-US", { month: "short" }),
      count,
      fullDate: new Date(currentDate),
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Get color based on count intensity with opacity
  const getBarColor = (count: number) => {
    if (count === 0) return "rgb(148 163 184 / 0.3)" // muted color with opacity
    const ratio = count / maxCount
    // Using rgb with opacity for better dark mode support
    if (ratio >= 0.75) return "rgb(129 140 248)" // full accent-primary
    if (ratio >= 0.5) return "rgb(129 140 248 / 0.8)" // 80% opacity
    if (ratio >= 0.25) return "rgb(129 140 248 / 0.5)" // 50% opacity
    return "rgb(129 140 248 / 0.25)" // 25% opacity
  }

  const todayStr = endDate.toISOString().split("T")[0]

  // Chart configuration
  const chartConfig = {
    count: {
      label: "Entries",
    },
  }

  return (
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
          {/* Bar chart */}
          <ChartContainer config={chartConfig} className="h-36 w-full">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, bottom: 10, left: 10 }}
              barGap={1}
              barCategoryGap="5%"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(data: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (data?.activePayload?.[0]) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  const payload = data.activePayload[0].payload as typeof chartData[0]
                  onDateClick?.(payload.date)
                }
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(148 163 184 / 0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{
                  fontSize: 10,
                  fill: "rgb(148 163 184 / 0.7)"
                }}
                tickLine={false}
                axisLine={{ stroke: "rgb(148 163 184 / 0.2)" }}
                interval={7} // Show every 8th day
                height={25}
              />
              <YAxis hide />
              <ChartTooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={({ active, payload }: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  if (active && payload?.length) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const data = payload[0].payload as typeof chartData[0]
                    return (
                      <div className="rounded-lg border bg-card/95 p-2.5 shadow-xl backdrop-blur-sm">
                        <div className="space-y-1">
                          <p className="font-semibold text-primary">
                            {data.fullDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {data.count} {data.count === 1 ? "entry" : "entries"}
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="count"
                radius={[2, 2, 0, 0]}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.count)}
                    stroke={entry.date === todayStr ? "rgb(129 140 248)" : "none"}
                    strokeWidth={entry.date === todayStr ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Legend and date range */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-muted-foreground/70">
              <span>Less</span>
              <div className="flex gap-1">
                <div
                  className="h-3 w-3 rounded-[2px] border border-border/40"
                  style={{ backgroundColor: "rgb(148 163 184 / 0.3)" }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-border/20"
                  style={{ backgroundColor: "rgb(129 140 248 / 0.25)" }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-border/20"
                  style={{ backgroundColor: "rgb(129 140 248 / 0.5)" }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-border/20"
                  style={{ backgroundColor: "rgb(129 140 248 / 0.8)" }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-accent-primary/20"
                  style={{ backgroundColor: "rgb(129 140 248)" }}
                />
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
  )
}
