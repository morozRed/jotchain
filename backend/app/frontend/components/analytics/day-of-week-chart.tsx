import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DowDataPoint } from "@/types"

interface DayOfWeekChartProps {
  data: DowDataPoint[]
  onDayClick?: (dow: number) => void
}

export function DayOfWeekChart({ data, onDayClick }: DayOfWeekChartProps) {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const bestDay = data.reduce((max, point) => (point.count > max.count ? point : max), data[0])

  const chartData = data.map((point) => ({
    dow: point.isoDow,
    day: dayNames[point.isoDow - 1],
    dayShort: dayNames[point.isoDow - 1].slice(0, 3),
    count: point.count,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data?.activePayload?.[0]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const dow = data.activePayload[0].payload.dow
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onDayClick?.(dow)
    }
  }

  return (
    <Card className="border-border-subtle bg-surface">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Day of Week</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {bestDay && `Best day: ${dayNames[bestDay.isoDow - 1]}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Entries",
              color: "var(--chart-2)",
            },
          }}
          className="h-[240px] w-full"
        >
          <BarChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="dayShort"
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="var(--border-subtle)"
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="var(--border-subtle)"
              tickLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--chart-2)", fillOpacity: 0.1 }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-2)"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              className="cursor-pointer transition-opacity hover:opacity-70"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
