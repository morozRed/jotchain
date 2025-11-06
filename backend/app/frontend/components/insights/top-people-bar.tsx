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
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="name" type="category" className="text-xs" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface-card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              cursor={{ fill: "hsl(var(--accent-secondary) / 0.1)" }}
              formatter={(value: number) => [`${value} mentions`, "Count"]}
            />
            <Bar dataKey="count" fill="hsl(var(--accent-secondary))" radius={[0, 4, 4, 0]} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
