import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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

  // Get opacity based on count intensity (using CSS variable for color)
  const getBarOpacity = (count: number) => {
    if (count === 0) return 0.15
    const ratio = count / maxCount
    if (ratio >= 0.75) return 1
    if (ratio >= 0.5) return 0.7
    if (ratio >= 0.25) return 0.45
    return 0.25
  }

  const todayStr = endDate.toISOString().split("T")[0]

  // Chart configuration
  const chartConfig = {
    count: {
      label: "Entries",
      color: "var(--chart-1)",
    },
  }

  return (
    <Card className="border-border-subtle bg-surface">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Activity Overview</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Daily activity over the last 60 days
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{
                  fontSize: 10,
                  fill: "var(--text-secondary)"
                }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-subtle)" }}
                interval={7}
                height={25}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                radius={[2, 2, 0, 0]}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count === 0 ? "var(--muted-foreground)" : "var(--chart-1)"}
                    fillOpacity={getBarOpacity(entry.count)}
                    stroke={entry.date === todayStr ? "var(--chart-1)" : "none"}
                    strokeWidth={entry.date === todayStr ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Legend and date range */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div
                  className="h-3 w-3 rounded-[2px] border border-border-subtle"
                  style={{ backgroundColor: "var(--muted-foreground)", opacity: 0.15 }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-border-subtle"
                  style={{ backgroundColor: "var(--chart-1)", opacity: 0.25 }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-border-subtle"
                  style={{ backgroundColor: "var(--chart-1)", opacity: 0.45 }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-border-subtle"
                  style={{ backgroundColor: "var(--chart-1)", opacity: 0.7 }}
                />
                <div
                  className="h-3 w-3 rounded-[2px] border border-border-subtle"
                  style={{ backgroundColor: "var(--chart-1)", opacity: 1 }}
                />
              </div>
              <span>More</span>
            </div>
            <div className="text-muted-foreground">
              {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
              {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
