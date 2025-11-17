import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
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
      <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl dark:bg-card/80">
        {/* Decorative gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chart-4/5 via-transparent to-chart-5/5 opacity-50" />

        <CardHeader className="relative z-10">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Top People</CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">Most mentioned people</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-center text-sm text-muted-foreground">No people mentioned yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl dark:bg-card/80">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chart-4/5 via-transparent to-chart-5/5 opacity-50" />

      <CardHeader className="relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Top People</CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            Most mentioned people
            {data.otherCount > 0 && ` (+${data.otherCount} others)`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <ChartContainer
          config={{
            count: {
              label: "Mentions",
            },
          }}
          className="h-[240px] w-full"
        >
          <BarChart data={chartData} onClick={handleClick} layout="vertical">
            <defs>
              <linearGradient id="colorPeople" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="rgba(148, 163, 184, 0.2)"
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              stroke="rgba(148, 163, 184, 0.2)"
              tickLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(34, 211, 238, 0.1)" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={({ active, payload }: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (active && payload?.length) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  const data = payload[0].payload as typeof chartData[0]
                  return (
                    <div className="rounded-lg border bg-card/95 p-2.5 shadow-xl backdrop-blur-sm">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} {data.count === 1 ? "mention" : "mentions"}
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#colorPeople)"
              radius={[0, 6, 6, 0]}
              className="cursor-pointer transition-opacity hover:opacity-80"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
