import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsightsPeopleData } from "@/types"

interface TopPeopleBarProps {
  data: InsightsPeopleData
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
      <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader>
          <CardTitle>Top People</CardTitle>
          <CardDescription>Most mentioned people</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No people mentioned yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>Top People</CardTitle>
        <CardDescription>
          Most mentioned people
          {data.otherCount > 0 && ` (+${data.otherCount} others)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} onClick={handleClick} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.3)"
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.3)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-card)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
              cursor={{ fill: "rgba(34, 211, 238, 0.1)" }}
              labelStyle={{ color: "var(--text-primary)" }}
              formatter={(value: number) => [`${value} mentions`, "Count"]}
            />
            <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
