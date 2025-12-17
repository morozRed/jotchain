import type { AnalyticsCards } from "@/types"

interface KpiCardsProps {
  data: AnalyticsCards
}

export function KpiCards({ data }: KpiCardsProps) {
  const avgFormatted = data.avgPerActiveDay.toFixed(1)

  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{data.totalEntries}</span>
      {data.totalEntries === 1 ? " entry" : " entries"} across{" "}
      <span className="font-medium text-foreground">{data.activeDays}</span>
      {data.activeDays === 1 ? " day" : " days"}
      {data.activeDays > 0 && (
        <>
          {" "}(avg <span className="font-medium text-foreground">{avgFormatted}</span>/day)
        </>
      )}
    </p>
  )
}
