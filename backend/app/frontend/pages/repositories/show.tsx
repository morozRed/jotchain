import { Head, Link } from "@inertiajs/react"
import {
  ArrowLeft,
  Clock,
  Code,
  ExternalLink,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Lock,
  Minus,
  Plus,
  Unlock,
} from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SharedData } from "@/types"

interface RepositoryDetail {
  id: string
  name: string
  fullName: string
  githubUrl: string
  private: boolean
  defaultBranch: string | null
  lastSyncedAt: string | null
}

interface RepositoryMetrics {
  throughput: number
  cycleTimeMedianHours: number | null
  reviewTurnaroundMedianHours: number | null
  openPrs: number
  stalePrs: number
  totalCommits: number
  additions: number
  deletions: number
  periodStart: string
  periodEnd: string
}

interface OpenPR {
  id: string
  number: number
  title: string
  author: string | null
  authorAvatar: string | null
  openedAt: string
  ageHours: number | null
  reviewCount: number
  stale: boolean
  draft: boolean
  url: string
}

interface RecentCommit {
  sha: string
  message: string
  author: string | null
  authorAvatar: string | null
  committedAt: string
  additions: number
  deletions: number
  url: string
}

interface Contributor {
  id: string
  login: string
  name: string | null
  avatarUrl: string
  commits: number
  prsMerged: number
}

interface Workspace {
  id: string
  name: string
  slug: string
}

type PageProps = SharedData & {
  workspace: Workspace
  repository: RepositoryDetail
  metrics: RepositoryMetrics
  openPrs: OpenPR[]
  recentCommits: RecentCommit[]
  contributors: Contributor[]
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
  icon: Icon,
}: {
  title: string
  value: string | number
  subtitle?: string
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
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function RepositoryShow() {
  const { repository, metrics, openPrs, recentCommits, contributors } =
    window.__page_props__ as unknown as PageProps

  return (
    <>
      <Head title={`${repository.fullName} - Repositories`} />

      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />

        <main className="flex-1 px-6 py-6 lg:px-12 lg:py-8">
          <div className="mx-auto max-w-6xl">
            {/* Back Link */}
            <Link
              href="/repositories"
              className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Repositories
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {repository.fullName}
                </h1>
                {repository.private ? (
                  <Lock className="size-4 text-muted-foreground" />
                ) : (
                  <Unlock className="size-4 text-muted-foreground" />
                )}
                <a
                  href={repository.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
              {repository.defaultBranch && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Default branch: {repository.defaultBranch}
                </p>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="PRs Merged"
                value={metrics.throughput}
                subtitle="Last 7 days"
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
                subtitle={
                  metrics.stalePrs > 0
                    ? `${metrics.stalePrs} stale`
                    : "None stale"
                }
                icon={GitPullRequest}
              />
              <MetricCard
                title="Commits"
                value={metrics.totalCommits}
                subtitle={`+${metrics.additions} / -${metrics.deletions}`}
                icon={GitCommit}
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contributors */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Active Contributors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contributors.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No activity in the last 7 days
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {contributors.slice(0, 10).map((contributor) => (
                          <Link
                            key={contributor.id}
                            href={`/team/contributors/${contributor.id}`}
                            className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-subtle/50"
                          >
                            <Avatar className="size-8">
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
                                {contributor.commits} commits · {contributor.prsMerged}{" "}
                                PRs
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Open PRs */}
              <div className="lg:col-span-2">
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
                        {openPrs.slice(0, 10).map((pr) => (
                          <a
                            key={pr.id}
                            href={pr.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded-md p-2 transition-colors hover:bg-subtle/50"
                          >
                            <div className="flex items-start gap-3">
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
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>#{pr.number}</span>
                                  {pr.author && (
                                    <>
                                      <span>·</span>
                                      <span>{pr.author}</span>
                                    </>
                                  )}
                                  <span>·</span>
                                  <span>{formatRelativeTime(pr.openedAt)}</span>
                                  {pr.stale && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-amber-600"
                                    >
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Commits */}
              <Card className="lg:col-span-3">
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
                      {recentCommits.slice(0, 15).map((commit) => (
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
                          {commit.authorAvatar && (
                            <Avatar className="size-6">
                              <AvatarImage src={commit.authorAvatar} />
                              <AvatarFallback>
                                {commit.author?.slice(0, 2).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm group-hover:text-primary">
                              {commit.message}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {commit.author && `${commit.author} · `}
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
