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

import { Button } from "@/components/ui/button"
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
  onQuotaConsumed?: () => void
  onInsightGenerated: (insight: InsightRequest) => void
  onGenerationStarted?: () => void
  onGenerationCompleted?: () => void
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
  onQuotaConsumed,
  onInsightGenerated,
  onGenerationStarted,
  onGenerationCompleted,
}: InsightTemplateCardsProps) {
  const [generating, setGenerating] = useState<QueryType | null>(null)
  const limitReached = remainingGenerations <= 0

  const finalizeGeneration = () => {
    setGenerating(null)
    onGenerationCompleted?.()
  }

  const handleGenerate = async (queryType: QueryType) => {
    if (limitReached) {
      alert(
        `You've reached the monthly AI generation limit of ${generationLimit} runs. Please wait for next month or upgrade your plan.`,
      )
      return
    }

    if (!dateRangeStart || !dateRangeEnd) {
      alert("Please select a date range")
      return
    }

    if (hasActiveInsights) {
      alert("Please wait for the current insight generation to complete before generating a new one.")
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
        alert(data.error ?? "Failed to generate insight")
        finalizeGeneration()
        return
      }

      if (data.id) {
        // Poll for completion
        pollInsightStatus(data.id)
      } else {
        finalizeGeneration()
      }
    } catch (error) {
      console.error("Failed to generate insight", error)
      alert("Failed to generate insight. Please try again.")
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
          alert(`Failed to generate insight: ${insight.errorMessage}`)
        }
        // Continue polling if status is pending or generating
      } catch (error) {
        console.error("Failed to poll insight status", error)
        clearInterval(interval)
        finalizeGeneration()
        alert("We ran into a problem while checking on your insight. Please try again.")
      }
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meta.queryTypes
          .filter((template) => template.value !== "custom")
          .map((template) => {
            const Icon = templateIcons[template.value]
            const isGenerating = generating === template.value
            const isAnotherTemplateGenerating =
              generating !== null && generating !== template.value
            const buttonDisabled =
              limitReached || hasActiveInsights || isGenerating || isAnotherTemplateGenerating

            return (
              <Card key={template.value} className="relative flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{template.label}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-end">
                  <Button
                    className="w-full"
                    onClick={() => void handleGenerate(template.value)}
                    disabled={buttonDisabled}
                  >
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {limitReached
                      ? "Monthly limit reached"
                      : hasActiveInsights
                        ? "Finish current insight"
                        : isGenerating
                          ? "Generating..."
                          : isAnotherTemplateGenerating
                            ? "Please wait..."
                            : "Generate"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {limitReached && (
        <p className="text-sm text-destructive">
          You&apos;ve used all {generationLimit} runs available this month. Contact support if you
          need additional capacity.
        </p>
      )}
    </div>
  )
}
