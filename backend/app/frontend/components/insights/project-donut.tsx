import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsightsProjectsData } from "@/types"

interface ProjectDonutProps {
  data: InsightsProjectsData
  onProjectClick?: (projectId: number) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const data = payload[0].payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const percentage = data.share ? (data.share * 100).toFixed(1) : 0
    return (
      <div className="rounded-lg border border-border/20 bg-popover p-3 shadow-md">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
        <p className="font-medium text-popover-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          {data.value} entries ({percentage}%)
        </p>
      </div>
    )
  }
  return null
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
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No projects mentioned yet</p>
              <p className="mt-1 text-xs">Tag entries with @project to see breakdown</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                stroke="none"
                dataKey="value"
                onClick={handleClick}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
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
        )}
      </CardContent>
    </Card>
  )
}
