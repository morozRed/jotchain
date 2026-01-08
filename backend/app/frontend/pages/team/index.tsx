import { Head, Link } from "@inertiajs/react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  ExternalLink,
  GitMerge,
  GitPullRequest,
  Users,
} from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SharedData } from "@/types"

interface Contributor {
  id: string
  login: string
  name: string | null
  avatarUrl: string
  throughput: number
  commits: number
  reviewsGiven: number
  wipCount: number
  cycleTimeMedianHours: number | null
}

interface OpenPR {
  id: string
  number: number
  title: string
  repository: string
  author: string | null
  authorAvatar: string | null
  openedAt: string
  ageHours: number | null
  reviewCount: number
  stale: boolean
  draft: boolean
  url: string
}

interface Signal {
  type: string
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  entityType: string
  entityId: string
  metadata: Record<string, any>
}

interface TeamMetrics {
  throughput: number
  cycleTimeMedianHours: number | null
  reviewTurnaroundMedianHours: number | null
  openPrs: number
  stalePrs: number
  activeContributors: number
  totalCommits: number
  throughputTrend: number | null
  periodStart: string
  periodEnd: string
  computedAt: string | null
}

interface Workspace {
  id: string
  name: string
  slug: string
}

type PageProps = SharedData & {
  workspace: Workspace
  metrics: TeamMetrics
  contributors: Contributor[]
  openPrs: OpenPR[]
  signals: Signal[]
  recentActivity: Array<{
    type: string
    timestamp: string
    title: string
    repository: string
    author: string | null
    url: string
  }>
}

function formatHours(hours: number | null): string {
  if (hours === null) return "—"
  if (hours < 24) return `${hours.toFixed(0)}h`
  const days = hours / 24
  return `${days.toFixed(1)}d`
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
}: {
  title: string
  value: string | number
  subtitle?: string
  trend?: number | null
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== null && trend !== undefined && (
            <span
              className={cn(
                "flex items-center text-xs font-medium",
                trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
              )}
            >
              {trend > 0 ? (
                <ArrowUp className="mr-0.5 size-3" />
              ) : trend < 0 ? (
                <ArrowDown className="mr-0.5 size-3" />
              ) : null}
              {Math.abs(trend).toFixed(0)}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

function SignalAlert({ signal }: { signal: Signal }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        signal.severity === "critical" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
        signal.severity === "warning" && "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
        signal.severity === "info" && "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
      )}
    >
      <AlertTriangle
        className={cn(
          "mt-0.5 size-4 shrink-0",
          signal.severity === "critical" && "text-red-600",
          signal.severity === "warning" && "text-amber-600",
          signal.severity === "info" && "text-blue-600"
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{signal.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{signal.description}</p>
      </div>
    </div>
  )
}

export default function TeamDashboard() {
  const { metrics, contributors, openPrs, signals } = window.__page_props__ as unknown as PageProps

  const criticalSignals = signals.filter((s) => s.severity === "critical")
  const warningSignals = signals.filter((s) => s.severity === "warning")
  const hasInstallation = contributors.length > 0 || openPrs.length > 0

  return (
    <>
      <Head title="Team" />

      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />

        <main className="flex-1 px-6 py-6 lg:px-12 lg:py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">Team Overview</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Last 7 days activity across connected repositories
              </p>
            </div>

            {!hasInstallation ? (
              <Card className="mx-auto max-w-lg">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <Users className="mb-4 size-12 text-muted-foreground/50" />
                  <h2 className="text-lg font-semibold">Connect GitHub</h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Install the GitHub App to see team activity, metrics, and signals.
                  </p>
                  <Link
                    href="/settings/integrations"
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Go to Integrations
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Signals */}
                {(criticalSignals.length > 0 || warningSignals.length > 0) && (
                  <div className="mb-8 space-y-3">
                    {criticalSignals.map((signal, i) => (
                      <SignalAlert key={`critical-${i}`} signal={signal} />
                    ))}
                    {warningSignals.slice(0, 3).map((signal, i) => (
                      <SignalAlert key={`warning-${i}`} signal={signal} />
                    ))}
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="PRs Merged"
                    value={metrics.throughput}
                    subtitle="Last 7 days"
                    trend={metrics.throughputTrend}
                    icon={GitMerge}
                  />
                  <MetricCard
                    title="Cycle Time"
                    value={formatHours(metrics.cycleTimeMedianHours)}
                    subtitle="Median open to merge"
                    icon={Clock}
                  />
                  <MetricCard
                    title="Open PRs"
                    value={metrics.openPrs}
                    subtitle={metrics.stalePrs > 0 ? `${metrics.stalePrs} stale` : "None stale"}
                    icon={GitPullRequest}
                  />
                  <MetricCard
                    title="Active Contributors"
                    value={metrics.activeContributors}
                    subtitle="Last 7 days"
                    icon={Users}
                  />
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  {/* Contributors */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Contributors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="divide-y">
                          {contributors.slice(0, 10).map((contributor) => (
                            <Link
                              key={contributor.id}
                              href={`/team/contributors/${contributor.id}`}
                              className="flex items-center gap-4 py-3 transition-colors hover:bg-subtle/50"
                            >
                              <Avatar className="size-9">
                                <AvatarImage src={contributor.avatarUrl} />
                                <AvatarFallback>
                                  {contributor.login.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {contributor.name || contributor.login}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{contributor.login}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span title="PRs merged">
                                  <GitMerge className="mr-1 inline size-3" />
                                  {contributor.throughput}
                                </span>
                                <span title="Commits">
                                  {contributor.commits} commits
                                </span>
                                <span title="Reviews given">
                                  {contributor.reviewsGiven} reviews
                                </span>
                                {contributor.wipCount > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {contributor.wipCount} WIP
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          ))}
                          {contributors.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                              No contributor activity yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Open PRs */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Open Pull Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {openPrs.slice(0, 8).map((pr) => (
                            <a
                              key={pr.id}
                              href={pr.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-md p-2 transition-colors hover:bg-subtle/50"
                            >
                              <div className="flex items-start gap-2">
                                <GitPullRequest
                                  className={cn(
                                    "mt-0.5 size-4 shrink-0",
                                    pr.stale ? "text-amber-500" : "text-emerald-500"
                                  )}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium group-hover:text-primary">
                                    {pr.title}
                                    <ExternalLink className="ml-1 inline size-3 opacity-0 group-hover:opacity-50" />
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    #{pr.number} · {pr.repository.split("/")[1]} · {pr.author}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatRelativeTime(pr.openedAt)}</span>
                                    {pr.stale && (
                                      <Badge variant="outline" className="text-xs text-amber-600">
                                        Stale
                                      </Badge>
                                    )}
                                    {pr.draft && (
                                      <Badge variant="outline" className="text-xs">
                                        Draft
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </a>
                          ))}
                          {openPrs.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                              No open pull requests
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
