import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { ActivityDataPoint } from "@/types"

interface ActivityLineChartProps {
  activity: ActivityDataPoint[]
  rolling7?: ActivityDataPoint[]
  onDateClick?: (date: string) => void
}

export function ActivityLineChart({ activity, rolling7, onDateClick }: ActivityLineChartProps) {
  const [showRolling, setShowRolling] = useState(false)

  // Merge activity and rolling data
  const chartData = activity.map((point) => {
    const rolling = rolling7?.find((r) => r.date === point.date)
    return {
      date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: point.date,
      count: point.count,
      rolling: rolling?.count ?? null,
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data?.activePayload?.[0]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const fullDate = data.activePayload[0].payload.fullDate
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onDateClick?.(fullDate)
    }
  }

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl dark:bg-card/80">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chart-2/5 via-transparent to-chart-3/5 opacity-50" />

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Activity Timeline</CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">Daily entry counts over time</CardDescription>
          </div>
          {rolling7 && rolling7.length > 0 && (
            <div className="flex items-center space-x-2">
              <Switch id="rolling-average" checked={showRolling} onCheckedChange={setShowRolling} />
              <Label htmlFor="rolling-average" className="text-sm text-muted-foreground">
                7-day average
              </Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} onClick={handleClick}>
            <defs>
              <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRolling" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="date"
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
              labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#818cf8"
              strokeWidth={2.5}
              fill="url(#colorEntries)"
              name="Entries"
              activeDot={{
                r: 6,
                fill: "#818cf8",
                strokeWidth: 2,
                stroke: "#818cf8",
                className: "cursor-pointer",
                style: {
                  filter: "drop-shadow(0 0 8px rgba(129, 140, 248, 0.8))",
                },
              }}
            />
            {showRolling && rolling7 && rolling7.length > 0 && (
              <Area
                type="monotone"
                dataKey="rolling"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorRolling)"
                name="7-day Avg"
                activeDot={{
                  r: 5,
                  fill: "#22d3ee",
                  strokeWidth: 2,
                  stroke: "#22d3ee",
                  className: "cursor-pointer",
                  style: {
                    filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))",
                  },
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
