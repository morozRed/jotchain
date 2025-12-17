import { useState } from "react"
import { Cell, Legend, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { AnalyticsProjectsData } from "@/types"

interface ProjectDonutProps {
  data: AnalyticsProjectsData
  onProjectClick?: (projectId: number) => void
}

// Use design token colors with good differentiation
const COLORS = [
  "var(--chart-1)", // forest green primary
  "var(--chart-2)", // mid-tone green
  "var(--chart-3)", // lighter green
  "var(--chart-4)", // very light green
  "var(--chart-5)", // neutral gray
]

export function ProjectDonut({ data, onProjectClick }: ProjectDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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
      color: "var(--muted-foreground)",
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
    <Card className="border-border-subtle bg-surface">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Project Breakdown</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Distribution of entries across projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No projects tracked yet</p>
              <p className="mt-1 text-xs">Use #project in your entries to see distribution</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: "Entries",
              },
            }}
            className="h-[240px] w-full"
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--surface)"
                strokeWidth={2}
                dataKey="value"
                onClick={handleClick}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                className="cursor-pointer"
                animationBegin={0}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={activeIndex === index ? 1 : 0.85}
                    stroke={activeIndex === index ? entry.color : "var(--surface)"}
                    strokeWidth={activeIndex === index ? 3 : 2}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: "var(--foreground)", paddingTop: "12px" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: string, entry: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  const percentage = entry.payload.share ? (entry.payload.share * 100).toFixed(0) : 0
                  return `${value} (${percentage}%)`
                }}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
