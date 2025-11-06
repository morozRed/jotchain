import { Activity, Calendar, Flame, Focus, Target, TrendingUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AnalyticsCards } from "@/types"

interface KpiCardsProps {
  data: AnalyticsCards
}

export function KpiCards({ data }: KpiCardsProps) {
  const cards = [
    {
      title: "Total Entries",
      value: data.totalEntries,
      icon: Calendar,
      description: "Total number of entries in the selected period",
      iconColor: "text-chart-2",
      iconBg: "bg-chart-2/10",
    },
    {
      title: "Active Days",
      value: data.activeDays,
      icon: Activity,
      description: "Number of days with at least one entry",
      iconColor: "text-chart-4",
      iconBg: "bg-chart-4/10",
    },
    {
      title: "Current Streak",
      value: data.currentStreak,
      icon: Flame,
      description: "Consecutive active days up to today",
      suffix: data.currentStreak === 1 ? "day" : "days",
      iconColor: "text-chart-1",
      iconBg: "bg-chart-1/10",
    },
    {
      title: "Longest Streak",
      value: data.longestStreak,
      icon: TrendingUp,
      description: "Maximum consecutive active days",
      suffix: data.longestStreak === 1 ? "day" : "days",
      iconColor: "text-chart-3",
      iconBg: "bg-chart-3/10",
    },
    {
      title: "Avg per Active Day",
      value: data.avgPerActiveDay,
      icon: Target,
      description: "Average entries per day with activity",
      format: (val: number) => val.toFixed(1),
      iconColor: "text-chart-5",
      iconBg: "bg-chart-5/10",
    },
    {
      title: "Focus Score",
      value: data.focusScore,
      icon: Focus,
      description: "Concentration across projects (0-100, higher = more focused)",
      iconColor: "text-accent-primary",
      iconBg: "bg-accent-primary/10",
      showProgress: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const displayValue = card.format ? card.format(card.value) : card.value
        const suffixText = card.suffix ? ` ${card.suffix}` : ""
        const progressPercentage = card.showProgress ? Math.min(data.focusScore, 100) : null

        return (
          <TooltipProvider key={card.title}>
            <Tooltip>
              <TooltipTrigger asChild className="pt-0 pb-0">
                <Card className="group relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-lg dark:bg-card/80">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-secondary/10" />
                  <CardContent className="relative flex items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">{card.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold sm:text-3xl">{displayValue}</span>
                        {suffixText && (
                          <span className="text-sm font-medium text-muted-foreground sm:text-base">{suffixText}</span>
                        )}
                      </div>
                      {card.showProgress && progressPercentage !== null && (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted/60">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{progressPercentage}%</span>
                        </div>
                      )}
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconBg} ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{card.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}
