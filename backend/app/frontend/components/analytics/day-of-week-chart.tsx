import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

  const total = data.reduce((sum, point) => sum + point.count, 0)

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
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl dark:bg-card/80">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chart-3/5 via-transparent to-chart-4/5 opacity-50" />

      <CardHeader className="relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Day of Week</CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            {bestDay && `Best day: ${dayNames[bestDay.isoDow - 1]}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} onClick={handleClick}>
            <defs>
              <linearGradient id="colorDow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="dayShort"
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
              cursor={{ fill: "rgba(34, 211, 238, 0.1)" }}
              labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
              formatter={(value: number) => {
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return [`${value} entries (${percentage}%)`, "Count"]
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#colorDow)"
              radius={[6, 6, 0, 0]}
              className="cursor-pointer transition-opacity hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
