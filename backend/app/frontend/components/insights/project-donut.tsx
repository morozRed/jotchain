import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsightsProjectsData } from "@/types"

interface ProjectDonutProps {
  data: InsightsProjectsData
  onProjectClick?: (projectId: number) => void
}

const COLORS = [
  "#818cf8", // accent-primary (indigo)
  "#22d3ee", // accent-secondary (cyan)
  "#8b5cf6", // purple
  "#f472b6", // accent-hot (pink)
  "#f59e0b", // chart-1 (amber)
  "#10b981", // chart-4 (green)
  "#3b82f6", // chart-2 (blue)
  "#ef4444", // chart-5 (red)
  "#6366f1", // indigo-500
  "#14b8a6", // teal
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
      color: "#94a3b8", // muted color for "Other"
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
                backgroundColor: "var(--surface-card)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
              labelStyle={{ color: "var(--text-primary)" }}
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
              wrapperStyle={{ color: "var(--text-primary)" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: string, entry: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
