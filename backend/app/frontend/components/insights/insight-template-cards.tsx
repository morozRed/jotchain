import {
  BookOpen,
  FileText,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  Star,
  Twitter,
} from "lucide-react"
import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { insightPath } from "@/routes"

import type { InsightRequest, InsightsMeta, QueryType } from "./types"

interface InsightTemplateCardsProps {
  meta: InsightsMeta
  dateRangeStart?: Date
  dateRangeEnd?: Date
  projectIds: string[]
  hasActiveInsights?: boolean
  generationLimit: number
  remainingGenerations: number
  canGenerateInsights: boolean
  onQuotaConsumed?: () => void
  onInsightGenerated: (insight: InsightRequest) => void
  onInsightQueued?: (insight: InsightRequest) => void
  onGenerationStarted?: () => void
  onGenerationCompleted?: () => void
  onAlert?: (message: string | null) => void
}

const templateIcons = {
  summary: FileText,
  tweets: Twitter,
  review: Star,
  blog: BookOpen,
  update: Mail,
  ideas: Lightbulb,
  custom: MessageSquare,
}

interface InsightGenerationResponse {
  id?: string
  error?: string
}

export function InsightTemplateCards({
  meta,
  dateRangeStart,
  dateRangeEnd,
  projectIds,
  hasActiveInsights = false,
  generationLimit,
  remainingGenerations,
  canGenerateInsights,
  onQuotaConsumed,
  onInsightGenerated,
  onInsightQueued,
  onGenerationStarted,
  onGenerationCompleted,
  onAlert,
}: InsightTemplateCardsProps) {
  const [generating, setGenerating] = useState<QueryType | null>(null)
  const limitReached = remainingGenerations <= 0
  const showAlert = (message: string) => {
    if (onAlert) {
      onAlert(message)
    } else {
      console.warn(message)
    }
  }

  const notifyQueuedInsight = async (insightId: string) => {
    if (!onInsightQueued) return

    try {
      const response = await fetch(insightPath(insightId))
      if (!response.ok) return
      const insight = (await response.json()) as InsightRequest
      onInsightQueued(insight)
    } catch (error) {
      console.error("Failed to fetch queued insight", error)
    }
  }

  const finalizeGeneration = () => {
    setGenerating(null)
    onGenerationCompleted?.()
  }

  const handleGenerate = async (queryType: QueryType) => {
    onAlert?.(null)

    if (!canGenerateInsights) {
      showAlert("You need an active subscription to generate new insights.")
      return
    }

    if (limitReached) {
      showAlert(
        `You've reached the monthly AI generation limit of ${generationLimit} runs. Please wait for next month or upgrade your plan.`,
      )
      return
    }

    if (!dateRangeStart || !dateRangeEnd) {
      showAlert("Please select a date range.")
      return
    }

    if (hasActiveInsights) {
      showAlert("Please wait for the current insight generation to complete before generating a new one.")
      return
    }

    setGenerating(queryType)
    onGenerationStarted?.()

    try {
      const response = await fetch("/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? "",
        },
        body: JSON.stringify({
          insight_request: {
            query_type: queryType,
            date_range_start: dateRangeStart.toISOString(),
            date_range_end: dateRangeEnd.toISOString(),
            project_ids: projectIds,
            person_ids: [],
          },
        }),
      })

      const data = (await response.json()) as InsightGenerationResponse

      if (!response.ok) {
        showAlert(data.error ?? "Failed to generate insight.")
        finalizeGeneration()
        return
      }

      if (data.id) {
        void notifyQueuedInsight(data.id)
        // Poll for completion
        pollInsightStatus(data.id)
      } else {
        finalizeGeneration()
      }
    } catch (error) {
      console.error("Failed to generate insight", error)
      showAlert("Failed to generate insight. Please try again.")
      finalizeGeneration()
    }
  }

  const pollInsightStatus = (insightId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(insightPath(insightId))
        const insight = (await response.json()) as InsightRequest

        if (insight.status === "completed") {
          clearInterval(interval)
          onQuotaConsumed?.()
          finalizeGeneration()
          onInsightGenerated(insight)
        } else if (insight.status === "failed") {
          clearInterval(interval)
          finalizeGeneration()
          showAlert(`Failed to generate insight: ${insight.errorMessage}`)
        }
        // Continue polling if status is pending or generating
      } catch (error) {
        console.error("Failed to poll insight status", error)
        clearInterval(interval)
        finalizeGeneration()
        showAlert("We ran into a problem while checking on your insight. Please try again.")
      }
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {meta.queryTypes
          .filter((template) => template.value !== "custom")
          .map((template) => {
            const Icon = templateIcons[template.value]
            const isGenerating = generating === template.value
            const isAnotherTemplateGenerating =
              generating !== null && generating !== template.value
            const generationBlocked = limitReached || !canGenerateInsights
            const buttonDisabled =
              generationBlocked || hasActiveInsights || isGenerating || isAnotherTemplateGenerating

            return (
              <button
                key={template.value}
                onClick={() => void handleGenerate(template.value)}
                disabled={buttonDisabled}
                className="group relative flex flex-col overflow-hidden rounded-lg border bg-card p-4 text-left transition-all hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border shadow-none"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{template.label}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  {isGenerating && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  )}
                </div>

                <div className="mt-auto pt-3 border-t">
                  <div className="flex items-center justify-center gap-2 text-xs font-medium">
                    {limitReached ? (
                      <span className="text-destructive">Quota reached</span>
                    ) : !canGenerateInsights ? (
                      <span className="text-amber-600">Upgrade required</span>
                    ) : hasActiveInsights && !isGenerating ? (
                      <span className="text-muted-foreground">Please wait...</span>
                    ) : isGenerating ? (
                      <span className="text-primary">Generating...</span>
                    ) : isAnotherTemplateGenerating ? (
                      <span className="text-muted-foreground">Please wait...</span>
                    ) : (
                      <span className="text-primary group-hover:text-primary/80">
                        Click to generate
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
      </div>

      {limitReached && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium">
            You&apos;ve used all {generationLimit} runs available this month. Contact support if you
            need additional capacity.
          </p>
        </div>
      )}
    </div>
  )
}
