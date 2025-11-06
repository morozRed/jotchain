import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsightsProjectsData } from "@/types"

interface ProjectDonutProps {
  data: InsightsProjectsData
  onProjectClick?: (projectId: number) => void
}

const COLORS = [
  "hsl(var(--accent-primary))",
  "hsl(var(--accent-secondary))",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
]

export function ProjectDonut({ data, onProjectClick }: ProjectDonutProps) {
  const chartData = [
    ...data.top.map((project, index) => ({
      name: project.name,
      value: project.count,
      id: project.id,
      share: project.share,
      color: COLORS[index % COLORS.length],
    })),
  ]

  if (data.otherCount > 0) {
    chartData.push({
      name: "Other",
      value: data.otherCount,
      id: -1,
      share: 0,
      color: "hsl(var(--muted-foreground))",
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data?.id && data.id !== -1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      onProjectClick?.(data.id)
    }
  }

  return (
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>Project Breakdown</CardTitle>
        <CardDescription>Distribution of entries across projects</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              onClick={handleClick}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface-card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: number, name: string, props: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const percentage = props.payload.share ? (props.payload.share * 100).toFixed(1) : 0
                return [`${value} entries (${percentage}%)`, name]
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: any) => {
                const percentage = entry.payload.share ? (entry.payload.share * 100).toFixed(0) : 0
                return `${value} (${percentage}%)`
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
