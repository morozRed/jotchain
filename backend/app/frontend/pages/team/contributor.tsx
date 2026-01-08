import { Head, Link } from "@inertiajs/react"
import {
  ArrowLeft,
  Clock,
  Code,
  ExternalLink,
  GitCommit,
  GitMerge,
  GitPullRequest,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { SharedData } from "@/types"

interface ContributorDetail {
  id: string
  login: string
  name: string | null
  avatarUrl: string
  githubUrl: string
}

interface PeriodMetrics {
  period: string
  throughput: number
  cycleTimeMedianHours: number | null
  reviewTurnaroundMedianHours: number | null
  reviewsGiven: number
  reviewsReceived: number
  reviewLoadRatio: number | null
  wipCount: number
  commits: number
  additions: number
  deletions: number
}

interface OpenPR {
  id: string
  number: number
  title: string
  repository: string
  openedAt: string
  ageHours: number | null
  reviewCount: number
  stale: boolean
  url: string
}

interface RecentCommit {
  sha: string
  message: string
  repository: string
  committedAt: string
  additions: number
  deletions: number
  url: string
}

interface ReviewActivity {
  id: string
  state: string
  prNumber: number
  prTitle: string
  prAuthor: string | null
  repository: string
  submittedAt: string
  url: string
}

interface Workspace {
  id: string
  name: string
  slug: string
}

type PageProps = SharedData & {
  workspace: Workspace
  contributor: ContributorDetail
  metrics: PeriodMetrics[]
  openPrs: OpenPR[]
  recentCommits: RecentCommit[]
  reviewActivity: ReviewActivity[]
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

function getPeriodLabel(period: string): string {
  switch (period) {
    case "rolling_7d":
      return "7 days"
    case "rolling_14d":
      return "14 days"
    case "rolling_30d":
      return "30 days"
    default:
      return period
  }
}

function MetricRow({
  label,
  value,
  subtitle,
}: {
  label: string
  value: string | number
  subtitle?: string
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium">{value}</span>
        {subtitle && (
          <span className="ml-1 text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  )
}

function ReviewStateBadge({ state }: { state: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    APPROVED: {
      label: "Approved",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    },
    CHANGES_REQUESTED: {
      label: "Changes",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
    COMMENTED: {
      label: "Commented",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
  }

  const variant = variants[state] || { label: state, className: "" }

  return (
    <Badge variant="outline" className={cn("text-xs", variant.className)}>
      {variant.label}
    </Badge>
  )
}

export default function ContributorProfile() {
  const { contributor, metrics, openPrs, recentCommits, reviewActivity } =
    window.__page_props__ as unknown as PageProps

  const currentMetrics = metrics.find((m) => m.period === "rolling_7d") || metrics[0]

  return (
    <>
      <Head title={`${contributor.name || contributor.login} - Team`} />

      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />

        <main className="flex-1 px-6 py-6 lg:px-12 lg:py-8">
          <div className="mx-auto max-w-5xl">
            {/* Back Link */}
            <Link
              href="/team"
              className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Team
            </Link>

            {/* Header */}
            <div className="mb-8 flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarImage src={contributor.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {contributor.login.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {contributor.name || contributor.login}
                  </h1>
                  <a
                    href={contributor.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  @{contributor.login}
                </p>
              </div>
            </div>

            {/* Metrics by Period */}
            <div className="mb-8">
              <Tabs defaultValue="rolling_7d">
                <TabsList>
                  {metrics.map((m) => (
                    <TabsTrigger key={m.period} value={m.period}>
                      {getPeriodLabel(m.period)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {metrics.map((m) => (
                  <TabsContent key={m.period} value={m.period}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <GitMerge className="size-4" />
                            PRs Merged
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{m.throughput}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Clock className="size-4" />
                            Cycle Time
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatHours(m.cycleTimeMedianHours)}
                          </div>
                          <p className="text-xs text-muted-foreground">median</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <GitCommit className="size-4" />
                            Commits
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{m.commits}</div>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600">+{m.additions}</span>
                            {" / "}
                            <span className="text-red-600">-{m.deletions}</span>
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MessageSquare className="size-4" />
                            Reviews
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{m.reviewsGiven}</div>
                          <p className="text-xs text-muted-foreground">
                            given · {m.reviewsReceived} received
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Additional Metrics */}
                    <Card className="mt-4">
                      <CardContent className="pt-4">
                        <div className="grid gap-x-8 sm:grid-cols-2">
                          <MetricRow
                            label="Review Turnaround"
                            value={formatHours(m.reviewTurnaroundMedianHours)}
                            subtitle="median"
                          />
                          <MetricRow
                            label="Review Load Ratio"
                            value={
                              m.reviewLoadRatio !== null
                                ? m.reviewLoadRatio.toFixed(2)
                                : "—"
                            }
                          />
                          <MetricRow label="WIP Count" value={m.wipCount} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Open PRs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GitPullRequest className="size-4" />
                    Open Pull Requests
                    {openPrs.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {openPrs.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {openPrs.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No open pull requests
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {openPrs.map((pr) => (
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
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                #{pr.number} · {pr.repository.split("/")[1]}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatRelativeTime(pr.openedAt)}</span>
                                <span>· {pr.reviewCount} reviews</span>
                                {pr.stale && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-amber-600"
                                  >
                                    Stale
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="size-4" />
                    Recent Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewActivity.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No recent review activity
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reviewActivity.slice(0, 8).map((review) => (
                        <a
                          key={review.id}
                          href={review.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block rounded-md p-2 transition-colors hover:bg-subtle/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium group-hover:text-primary">
                                {review.prTitle}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                #{review.prNumber} · {review.repository.split("/")[1]}
                                {review.prAuthor && ` · by ${review.prAuthor}`}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatRelativeTime(review.submittedAt)}
                              </p>
                            </div>
                            <ReviewStateBadge state={review.state} />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Commits */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Code className="size-4" />
                    Recent Commits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentCommits.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No recent commits
                    </p>
                  ) : (
                    <div className="divide-y">
                      {recentCommits.slice(0, 10).map((commit) => (
                        <a
                          key={commit.sha}
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 py-3 transition-colors hover:bg-subtle/50"
                        >
                          <code className="shrink-0 font-mono text-xs text-muted-foreground">
                            {commit.sha}
                          </code>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm group-hover:text-primary">
                              {commit.message}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {commit.repository.split("/")[1]} ·{" "}
                              {formatRelativeTime(commit.committedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center text-emerald-600">
                              <Plus className="mr-0.5 size-3" />
                              {commit.additions}
                            </span>
                            <span className="flex items-center text-red-600">
                              <Minus className="mr-0.5 size-3" />
                              {commit.deletions}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
