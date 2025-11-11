import { Calendar, ChevronDown, FolderOpen } from "lucide-react"
import { useEffect, useState } from "react"

import type { DatePresetOption, InsightsMeta, ProjectOption } from "./types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InsightFormProps {
  meta: InsightsMeta
  dateRangeStart?: Date
  dateRangeEnd?: Date
  selectedProjects: string[]
  onDateRangeStartChange: (date: Date | undefined) => void
  onDateRangeEndChange: (date: Date | undefined) => void
  onProjectsChange: (projects: string[]) => void
}

export function InsightForm({
  meta,
  dateRangeStart,
  dateRangeEnd,
  selectedProjects,
  onDateRangeStartChange,
  onDateRangeEndChange,
  onProjectsChange,
}: InsightFormProps) {
  const [datePreset, setDatePreset] = useState("last_7_days")

  useEffect(() => {
    // Set initial date range (last 7 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    onDateRangeStartChange(start)
    onDateRangeEndChange(end)
  }, [])

  const handleDatePresetChange = (value: string) => {
    setDatePreset(value)

    const end = new Date()
    let start = new Date()

    switch (value) {
      case "last_7_days":
        start.setDate(start.getDate() - 7)
        break
      case "last_14_days":
        start.setDate(start.getDate() - 14)
        break
      case "last_30_days":
        start.setDate(start.getDate() - 30)
        break
      case "this_week":
        start.setDate(start.getDate() - start.getDay())
        break
      case "this_month":
        start.setDate(1)
        break
      case "this_quarter":
        const quarter = Math.floor(start.getMonth() / 3)
        start.setMonth(quarter * 3, 1)
        break
      case "this_year":
        start.setMonth(0, 1)
        break
    }

    onDateRangeStartChange(start)
    onDateRangeEndChange(end)
  }

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    if (projectId === "all") {
      if (checked) {
        // Select all projects
      onProjectsChange(["all"])
      } else {
        // When unchecking "all", select all individual projects
        onProjectsChange(meta.projects.map((p) => p.value))
      }
    } else {
      const filtered = selectedProjects.filter((p) => p !== "all")
      if (checked) {
        // Add the project
        onProjectsChange([...filtered, projectId])
      } else {
        // Remove the project
        const remaining = filtered.filter((p) => p !== projectId)
        // If no projects selected, default to "all"
        onProjectsChange(remaining.length > 0 ? remaining : ["all"])
      }
    }
  }

  const getProjectsDisplayText = () => {
    if (selectedProjects.includes("all")) {
      return "All Projects"
    }
    if (selectedProjects.length === 0) {
      return "Select projects"
    }
    if (selectedProjects.length === 1) {
      const project = meta.projects.find((p) => p.value === selectedProjects[0])
      return project?.label || "Select projects"
    }
    return `${selectedProjects.length} projects selected`
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="date-preset" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Label>
        <Select value={datePreset} onValueChange={handleDatePresetChange}>
          <SelectTrigger id="date-preset" className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            {meta.datePresets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Projects
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              <span>{getProjectsDisplayText()}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuLabel>Select Projects</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedProjects.includes("all")}
              onCheckedChange={(checked) => handleProjectToggle("all", checked)}
              onSelect={(e) => e.preventDefault()}
          >
            All Projects
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
          {meta.projects.map((project) => (
              <DropdownMenuCheckboxItem
              key={project.value}
                checked={selectedProjects.includes(project.value)}
                onCheckedChange={(checked) => handleProjectToggle(project.value, checked)}
                onSelect={(e) => e.preventDefault()}
              disabled={selectedProjects.includes("all")}
            >
              {project.label}
              </DropdownMenuCheckboxItem>
          ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

