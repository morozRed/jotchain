import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>Hour of Day</CardTitle>
        <CardDescription>
          {peakHour && `Peak: ${formatHour(peakHour.hour)}`}
          {quietHour && quietHour.hour !== peakHour?.hour && ` • Quiet: ${formatHour(quietHour.hour)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
            <XAxis
              dataKey="hourLabel"
              interval={2}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.3)"
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.3)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-card)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
              cursor={{ fill: "rgba(129, 140, 248, 0.1)" }}
              labelStyle={{ color: "var(--text-primary)" }}
            />
            <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
