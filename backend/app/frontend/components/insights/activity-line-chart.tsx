import { useState } from "react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Daily entry counts over time</CardDescription>
          </div>
          {rolling7 && rolling7.length > 0 && (
            <div className="flex items-center space-x-2">
              <Switch id="rolling-average" checked={showRolling} onCheckedChange={setShowRolling} />
              <Label htmlFor="rolling-average" className="text-sm">
                7-day average
              </Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface-card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--accent-primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--accent-primary))" }}
              activeDot={{ r: 6, className: "cursor-pointer" }}
              name="Entries"
            />
            {showRolling && rolling7 && rolling7.length > 0 && (
              <Line
                type="monotone"
                dataKey="rolling"
                stroke="hsl(var(--accent-secondary))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="7-day Avg"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
