import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Project {
  id: number
  name: string
}

interface FilterBarProps {
  projects: Project[]
  selectedProject: number | null
  selectedRange: "week" | "month" | "year"
  onProjectChange: (projectId: number | null) => void
  onRangeChange: (range: "week" | "month" | "year") => void
}

export function FilterBar({
  projects,
  selectedProject,
  selectedRange,
  onProjectChange,
  onRangeChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:w-64">
        <Select
          value={selectedProject?.toString() ?? "all"}
          onValueChange={(value) => onProjectChange(value === "all" ? null : parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id.toString()}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedRange} onValueChange={(value) => onRangeChange(value as "week" | "month" | "year")}>
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
