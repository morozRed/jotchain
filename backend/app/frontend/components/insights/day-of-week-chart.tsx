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
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>Day of Week</CardTitle>
        <CardDescription>{bestDay && `Best day: ${dayNames[bestDay.isoDow - 1]}`}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="dayShort" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface-card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              cursor={{ fill: "hsl(var(--accent-primary) / 0.1)" }}
              formatter={(value: number) => {
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return [`${value} entries (${percentage}%)`, "Count"]
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--accent-secondary))" radius={[4, 4, 0, 0]} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
