import {
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Star,
  User,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { insightPath } from "@/routes"

import type { InsightRequest, InsightsMeta, QueryType, ReviewPerspective } from "./types"

interface InsightTemplateCardsProps {
  meta: InsightsMeta
  dateRangeStart?: Date
  dateRangeEnd?: Date
  projectIds: string[]
  personIds: string[]
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
  review: Star,
  update: Mail,
  custom: MessageSquare,
}

// Only show these templates (subtractive UX)
const allowedTemplates = ["summary", "update", "review", "custom"]

interface InsightGenerationResponse {
  id?: string
  error?: string
}

export function InsightTemplateCards({
  meta,
  dateRangeStart,
  dateRangeEnd,
  projectIds,
  personIds,
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
  const [selectedTemplate, setSelectedTemplate] = useState<QueryType | null>(null)
  const [generating, setGenerating] = useState<QueryType | null>(null)
  const [reviewPerson, setReviewPerson] = useState<string | null>(null)
  const [perspective, setPerspective] = useState<ReviewPerspective>("manager")
  const limitReached = remainingGenerations <= 0
  const isReviewSelected = selectedTemplate === "review"
  const showAlert = (message: string) => {
    if (onAlert) {
      onAlert(message)
    } else {
      console.warn(message)
    }
  }

  // Filter to only allowed templates
  const visibleTemplates = meta.queryTypes.filter(
    (template) => allowedTemplates.includes(template.value)
  )

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

  // Determine person_ids to send based on insight type
  const getPersonIdsForRequest = (queryType: QueryType): string[] => {
    if (queryType === "review") {
      // For reviews, use the dedicated reviewPerson if set (and not self-review)
      if (perspective === "self") {
        return [] // Self-review doesn't filter by person
      }
      if (reviewPerson) {
        return [reviewPerson]
      }
    }
    // For other types or if no review person selected, use the general filter
    return personIds.includes("all") ? [] : personIds
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
            person_ids: getPersonIdsForRequest(queryType),
            perspective: queryType === "review" ? perspective : undefined,
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

  const handleGenerateClick = () => {
    if (selectedTemplate) {
      void handleGenerate(selectedTemplate)
    }
  }

  const generationBlocked = limitReached || !canGenerateInsights
  const isGenerating = generating !== null
  const canGenerate = selectedTemplate && !generationBlocked && !hasActiveInsights && !isGenerating

  return (
    <div className="space-y-4">
      <fieldset className="space-y-1">
        <legend className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Output
        </legend>
        {visibleTemplates.map((template) => {
          const Icon = templateIcons[template.value as keyof typeof templateIcons]
          const isSelected = selectedTemplate === template.value
          const isThisGenerating = generating === template.value

          return (
            <label
              key={template.value}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary/5 ring-1 ring-primary/20"
                  : "hover:bg-subtle"
              } ${isThisGenerating ? "opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="template"
                value={template.value}
                checked={isSelected}
                onChange={() => setSelectedTemplate(template.value)}
                disabled={isGenerating}
                className="accent-primary"
              />
              {Icon && <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />}
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${isSelected ? "font-medium text-foreground" : "text-foreground"}`}>
                  {template.label}
                </span>
                <span className="text-sm text-muted-foreground ml-1.5">
                  — {template.description}
                </span>
              </div>
              {isThisGenerating && (
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              )}
            </label>
          )
        })}
      </fieldset>

      {/* Review-specific context section */}
      {isReviewSelected && (
        <div className="ml-7 pl-4 border-l-2 border-primary/20 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Perspective</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="perspective"
                  value="manager"
                  checked={perspective === "manager"}
                  onChange={() => setPerspective("manager")}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">Writing about someone</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="perspective"
                  value="self"
                  checked={perspective === "self"}
                  onChange={() => setPerspective("self")}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">Writing about myself</span>
              </label>
            </div>
          </div>

          {perspective === "manager" && meta.persons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Who is this review for?
              </p>
              <Select value={reviewPerson || ""} onValueChange={(v) => setReviewPerson(v || null)}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select a person (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {meta.persons.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      {person.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground/70">
                Focuses the review on entries mentioning this person.
              </p>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleGenerateClick}
        disabled={!canGenerate}
        className="w-full sm:w-auto"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate draft"
        )}
      </Button>

      {limitReached && (
        <p className="text-sm text-destructive">
          You&apos;ve used all {generationLimit} runs available this month.
        </p>
      )}
    </div>
  )
}
