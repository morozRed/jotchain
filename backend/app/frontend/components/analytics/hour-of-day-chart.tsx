import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { HourlyDataPoint } from "@/types"

interface HourOfDayChartProps {
  data: HourlyDataPoint[]
  onHourClick?: (hour: number) => void
}

export function HourOfDayChart({ data, onHourClick }: HourOfDayChartProps) {
  const peakHour = data.reduce((max, point) => (point.count > max.count ? point : max), data[0])
  const quietHour = data.reduce((min, point) => (point.count < min.count && point.count > 0 ? point : min), data[0])

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  const chartData = data.map((point) => ({
    hour: point.hour,
    hourLabel: formatHour(point.hour),
    count: point.count,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data?.activePayload?.[0]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const hour = data.activePayload[0].payload.hour
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onHourClick?.(hour)
    }
  }

  return (
    <Card className="border-border-subtle bg-surface">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Hour of Day</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {peakHour && `Peak: ${formatHour(peakHour.hour)}`}
          {quietHour && quietHour.hour !== peakHour?.hour && ` · Quiet: ${formatHour(quietHour.hour)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Entries",
              color: "var(--chart-1)",
            },
          }}
          className="h-[240px] w-full"
        >
          <BarChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="hourLabel"
              interval={2}
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
              cursor={{ fill: "var(--chart-1)", fillOpacity: 0.1 }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-1)"
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
