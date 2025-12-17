import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { AnalyticsPeopleData } from "@/types"

interface TopPeopleBarProps {
  data: AnalyticsPeopleData
  onPersonClick?: (personId: number) => void
}

export function TopPeopleBar({ data, onPersonClick }: TopPeopleBarProps) {
  const chartData = data.top.map((person) => ({
    id: person.id,
    name: person.name,
    count: person.count,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data?.activePayload?.[0]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const personId = data.activePayload[0].payload.id
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onPersonClick?.(personId)
    }
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-border-subtle bg-surface">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top People</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Most mentioned people</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">Use @person in your entries to track collaborations</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border-subtle bg-surface">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top People</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Most mentioned people
          {data.otherCount > 0 && ` (+${data.otherCount} others)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Mentions",
              color: "var(--chart-2)",
            },
          }}
          className="h-[240px] w-full"
        >
          <BarChart data={chartData} onClick={handleClick} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="var(--border-subtle)"
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="var(--border-subtle)"
              tickLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--chart-2)", fillOpacity: 0.1 }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-2)"
              fillOpacity={0.8}
              radius={[0, 4, 4, 0]}
              className="cursor-pointer transition-opacity hover:opacity-70"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
