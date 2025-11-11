import { router } from "@inertiajs/react"
import {
  BookOpen,
  FileText,
  Lightbulb,
  Mail,
  MessageSquare,
  Star,
  Twitter,
} from "lucide-react"
import { useState } from "react"

import type { InsightRequest, InsightsMeta, QueryType } from "./types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { insightPath } from "@/routes"

interface InsightTemplateCardsProps {
  meta: InsightsMeta
  dateRangeStart?: Date
  dateRangeEnd?: Date
  projectIds: string[]
  onInsightGenerated: (insight: InsightRequest) => void
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

export function InsightTemplateCards({
  meta,
  dateRangeStart,
  dateRangeEnd,
  projectIds,
  onInsightGenerated,
}: InsightTemplateCardsProps) {
  const [generating, setGenerating] = useState<QueryType | null>(null)

  const handleGenerate = async (queryType: QueryType) => {
    if (!dateRangeStart || !dateRangeEnd) {
      alert("Please select a date range")
      return
    }

    setGenerating(queryType)

    try {
      const response = await fetch("/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "",
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

      const data = await response.json()

      if (data.id) {
        // Poll for completion
        pollInsightStatus(data.id)
      }
    } catch (error) {
      console.error("Failed to generate insight", error)
      setGenerating(null)
    }
  }

  const pollInsightStatus = (insightId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(insightPath(insightId))
        const insight: InsightRequest = await response.json()

        if (insight.status === "completed") {
          clearInterval(interval)
          setGenerating(null)
          onInsightGenerated(insight)
        } else if (insight.status === "failed") {
          clearInterval(interval)
          setGenerating(null)
          alert(`Failed to generate insight: ${insight.errorMessage}`)
        }
      } catch (error) {
        console.error("Failed to poll insight status", error)
        clearInterval(interval)
        setGenerating(null)
      }
    }, 2000)
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Generate</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meta.queryTypes
          .filter((template) => template.value !== "custom")
          .map((template) => {
          const Icon = templateIcons[template.value]
          const isGenerating = generating === template.value

          return (
            <Card key={template.value} className="relative flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{template.label}</CardTitle>
                </div>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Button
                  className="w-full"
                  onClick={() => handleGenerate(template.value)}
                  disabled={isGenerating || !!generating}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
