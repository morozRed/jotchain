import { Activity, Calendar, Flame, Focus, Target, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { InsightsCards } from "@/types"

interface KpiCardsProps {
  data: InsightsCards
}

export function KpiCards({ data }: KpiCardsProps) {
  const cards = [
    {
      title: "Total Entries",
      value: data.totalEntries,
      icon: Calendar,
      description: "Total number of entries in the selected period",
    },
    {
      title: "Active Days",
      value: data.activeDays,
      icon: Activity,
      description: "Number of days with at least one entry",
    },
    {
      title: "Current Streak",
      value: data.currentStreak,
      icon: Flame,
      description: "Consecutive active days up to today",
      suffix: data.currentStreak === 1 ? "day" : "days",
    },
    {
      title: "Longest Streak",
      value: data.longestStreak,
      icon: TrendingUp,
      description: "Maximum consecutive active days",
      suffix: data.longestStreak === 1 ? "day" : "days",
    },
    {
      title: "Avg per Active Day",
      value: data.avgPerActiveDay,
      icon: Target,
      description: "Average entries per day with activity",
      format: (val: number) => val.toFixed(1),
    },
    {
      title: "Focus Score",
      value: data.focusScore,
      icon: Focus,
      description: "Concentration across projects (0-100, higher = more focused)",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const displayValue = card.format ? card.format(card.value) : card.value
        const suffixText = card.suffix ? ` ${card.suffix}` : ""

        return (
          <TooltipProvider key={card.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {displayValue}
                      {suffixText && <span className="text-base font-normal text-muted-foreground">{suffixText}</span>}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{card.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}
