import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ActivityDataPoint } from "@/types"

interface ActivityLineChartProps {
  activity: ActivityDataPoint[]
  rolling7?: ActivityDataPoint[]
  onDateClick?: (date: string) => void
}

export function ActivityLineChart({ activity, rolling7, onDateClick }: ActivityLineChartProps) {
  const hasRollingData = rolling7 && rolling7.length > 0

  // Merge activity and rolling data
  const chartData = activity.map((point) => {
    const rolling = rolling7?.find((r) => r.date === point.date)
    return {
      date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: point.date,
      fullDateObj: new Date(point.date),
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
    <Card className="border-border-subtle bg-surface">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Daily entry counts over time{hasRollingData ? " with 7-day average" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Entries",
              color: "var(--chart-1)",
            },
            rolling: {
              label: "7-day Avg",
              color: "var(--chart-2)",
            },
          }}
          className="h-[180px] w-full"
        >
          <AreaChart data={chartData} onClick={handleClick} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="var(--border-subtle)"
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="var(--border-subtle)"
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="var(--chart-1)"
              fillOpacity={0.15}
              name="Entries"
              activeDot={{
                r: 5,
                fill: "var(--chart-1)",
                strokeWidth: 2,
                stroke: "var(--surface)",
                className: "cursor-pointer",
              }}
            />
            {hasRollingData && (
              <Area
                type="monotone"
                dataKey="rolling"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="var(--chart-2)"
                fillOpacity={0.1}
                name="7-day Avg"
                activeDot={{
                  r: 4,
                  fill: "var(--chart-2)",
                  strokeWidth: 2,
                  stroke: "var(--surface)",
                  className: "cursor-pointer",
                }}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
