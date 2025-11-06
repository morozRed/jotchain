import { useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsProjectsData } from "@/types"

interface ProjectDonutProps {
  data: AnalyticsProjectsData
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
      <div className="rounded-lg border border-border/20 bg-card/95 backdrop-blur-sm p-3 shadow-lg">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
        <p className="font-semibold text-card-foreground">{data.name}</p>
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

// Generate gradient colors for each segment
const getGradientId = (index: number) => `gradient-${index}`
const getGradientColor = (baseColor: string, index: number) => {
  // Create gradients that go from lighter to darker
  // For now, we'll use the same color with different opacity
  return {
    id: getGradientId(index),
    startColor: baseColor,
    endColor: baseColor,
  }
}

export function ProjectDonut({ data, onProjectClick }: ProjectDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = [
    ...data.top.map((project, index) => ({
      name: project.name,
      value: project.count,
      id: project.id,
      share: project.share,
      color: COLORS[index % COLORS.length],
      gradient: getGradientColor(COLORS[index % COLORS.length], index),
    })),
  ]

  if (data.otherCount > 0) {
    chartData.push({
      name: "Other",
      value: data.otherCount,
      id: -1,
      share: 0,
      color: "#94a3b8",
      gradient: getGradientColor("#94a3b8", chartData.length),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl dark:bg-card/80">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chart-3/5 via-transparent to-chart-4/5 opacity-50" />

      <CardHeader className="relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Project Breakdown</CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            Distribution of entries across projects
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No projects mentioned yet</p>
              <p className="mt-1 text-xs">Tag entries with @project to see breakdown</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <defs>
                  {chartData.map((entry, index) => (
                    <linearGradient key={getGradientId(index)} id={getGradientId(index)} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.gradient.startColor} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.gradient.endColor} stopOpacity={0.75} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  stroke="none"
                  dataKey="value"
                  onClick={handleClick}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  className="cursor-pointer transition-all duration-300"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#${getGradientId(index)})`}
                      stroke={activeIndex === index ? entry.color : "transparent"}
                      strokeWidth={activeIndex === index ? 3 : 0}
                      style={{
                        filter: activeIndex === index ? `drop-shadow(0 0 8px ${entry.color}80)` : "none",
                        transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "var(--text-primary)", paddingTop: "12px" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: string, entry: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const percentage = entry.payload.share ? (entry.payload.share * 100).toFixed(0) : 0
                    return `${value} (${percentage}%)`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
