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
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl dark:bg-card/80">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chart-2/5 via-transparent to-chart-1/5 opacity-50" />

      <CardHeader className="relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Hour of Day</CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            {peakHour && `Peak: ${formatHour(peakHour.hour)}`}
            {quietHour && quietHour.hour !== peakHour?.hour && ` • Quiet: ${formatHour(quietHour.hour)}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} onClick={handleClick}>
            <defs>
              <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="hourLabel"
              interval={2}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="rgba(148, 163, 184, 0.2)"
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="rgba(148, 163, 184, 0.2)"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-card)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              cursor={{ fill: "rgba(129, 140, 248, 0.1)" }}
              labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
            />
            <Bar
              dataKey="count"
              fill="url(#colorHour)"
              radius={[6, 6, 0, 0]}
              className="cursor-pointer transition-opacity hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
