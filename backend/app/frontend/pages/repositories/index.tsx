import { Head, Link } from "@inertiajs/react"
import { ExternalLink, GitMerge, GitPullRequest, Lock, Unlock } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SharedData } from "@/types"

interface Repository {
  id: string
  name: string
  fullName: string
  githubUrl: string
  private: boolean
  openPrCount: number
  mergedPrs7d: number
  commits7d: number
  lastSyncedAt: string | null
}

interface Workspace {
  id: string
  name: string
  slug: string
}

type PageProps = SharedData & {
  workspace: Workspace
  repositories: Repository[]
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function RepositoriesIndex() {
  const { repositories } = window.__page_props__ as unknown as PageProps

  return (
    <>
      <Head title="Repositories" />

      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />

        <main className="flex-1 px-6 py-6 lg:px-12 lg:py-8">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">Repositories</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Connected repositories with sync enabled
              </p>
            </div>

            {repositories.length === 0 ? (
              <Card className="mx-auto max-w-lg">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <GitPullRequest className="mb-4 size-12 text-muted-foreground/50" />
                  <h2 className="text-lg font-semibold">No repositories connected</h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Install the GitHub App and enable sync for repositories to see
                    metrics.
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
              <div className="space-y-4">
                {repositories.map((repo) => (
                  <Card key={repo.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/repositories/${repo.id}`}
                              className="text-base font-medium hover:text-primary"
                            >
                              {repo.fullName}
                            </Link>
                            {repo.private ? (
                              <Lock className="size-3.5 text-muted-foreground" />
                            ) : (
                              <Unlock className="size-3.5 text-muted-foreground" />
                            )}
                            <a
                              href={repo.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Last synced: {formatRelativeTime(repo.lastSyncedAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <GitMerge className="size-4" />
                            <span className="font-medium">{repo.mergedPrs7d}</span>
                            <span className="text-xs">merged</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <GitPullRequest className="size-4" />
                            <span className="font-medium">{repo.openPrCount}</span>
                            <span className="text-xs">open</span>
                          </div>
                          <Badge variant="secondary">{repo.commits7d} commits</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
