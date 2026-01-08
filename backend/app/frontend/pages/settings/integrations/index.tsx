import { Head, Link, router } from "@inertiajs/react"
import { Check, ExternalLink, Github, Lock, RefreshCw, Trash2, Unlock } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import type { SharedData } from "@/types"

interface Repository {
  id: string
  name: string
  fullName: string
  private: boolean
  syncEnabled: boolean
  lastSyncedAt: string | null
}

interface Installation {
  id: string
  accountLogin: string
  accountType: string
  repositorySelection: string
  suspended: boolean
  repositories: Repository[]
  createdAt: string
}

interface Workspace {
  id: string
  name: string
  slug: string
}

type PageProps = SharedData & {
  workspace: Workspace
  installations: Installation[]
  githubConfigured: boolean
  canManageIntegrations: boolean
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

function RepositoryRow({
  repository,
  canManage,
}: {
  repository: Repository
  canManage: boolean
}) {
  const [syncing, setSyncing] = useState(false)

  const toggleSync = async () => {
    if (!canManage) return
    setSyncing(true)
    // This would need an API endpoint to toggle sync
    router.patch(
      `/api/repositories/${repository.id}`,
      { sync_enabled: !repository.syncEnabled },
      {
        preserveState: true,
        onFinish: () => setSyncing(false),
      }
    )
  }

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2">
        {repository.private ? (
          <Lock className="size-3.5 text-muted-foreground" />
        ) : (
          <Unlock className="size-3.5 text-muted-foreground" />
        )}
        <span className="text-sm">{repository.fullName}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">
          {repository.syncEnabled
            ? `Synced ${formatRelativeTime(repository.lastSyncedAt)}`
            : "Sync disabled"}
        </span>
        <Switch
          checked={repository.syncEnabled}
          onCheckedChange={toggleSync}
          disabled={!canManage || syncing}
          aria-label={`Toggle sync for ${repository.name}`}
        />
      </div>
    </div>
  )
}

export default function IntegrationsSettings() {
  const { installations, githubConfigured, canManageIntegrations } =
    window.__page_props__ as unknown as PageProps

  const handleInstallGitHub = () => {
    window.location.href = "/github/install"
  }

  const handleRemoveInstallation = (installationId: string) => {
    if (!confirm("Are you sure you want to remove this GitHub installation? This will stop syncing all repositories.")) {
      return
    }
    router.delete(`/github/installations/${installationId}`)
  }

  return (
    <AppLayout>
      <Head title="Integrations" />

      <SettingsLayout>
        <div className="space-y-8">
          {/* GitHub Integration */}
          <section>
            <h2 className="text-[15px] font-medium text-foreground">Integrations</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Connect external services to enhance your workspace
            </p>

            <div className="mt-6 space-y-4">
              {/* GitHub Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-900 dark:bg-neutral-100">
                        <Github className="size-5 text-white dark:text-neutral-900" />
                      </div>
                      <div>
                        <CardTitle className="text-base">GitHub</CardTitle>
                        <CardDescription>
                          Track team activity, PRs, and code metrics
                        </CardDescription>
                      </div>
                    </div>
                    {installations.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <Check className="size-3.5" />
                        Connected
                      </div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {!githubConfigured ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        GitHub App is not configured. Please contact your administrator.
                      </p>
                    </div>
                  ) : installations.length === 0 ? (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Install the GitHub App to start tracking team metrics
                      </p>
                      {canManageIntegrations && (
                        <Button onClick={handleInstallGitHub} className="mt-4" size="sm">
                          <Github className="mr-2 size-4" />
                          Install GitHub App
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {installations.map((installation) => (
                        <div key={installation.id}>
                          <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {installation.accountLogin}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({installation.accountType})
                              </span>
                              {installation.suspended && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                  Suspended
                                </span>
                              )}
                            </div>
                            {canManageIntegrations && (
                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://github.com/settings/installations`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="size-3.5" />
                                </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveInstallation(installation.id)}
                                  className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="mt-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                REPOSITORIES ({installation.repositories.length})
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {installation.repositorySelection === "all"
                                  ? "All repositories"
                                  : "Selected repositories"}
                              </span>
                            </div>
                            <div className="divide-y">
                              {installation.repositories.map((repo) => (
                                <RepositoryRow
                                  key={repo.id}
                                  repository={repo}
                                  canManage={canManageIntegrations}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {canManageIntegrations && (
                        <div className="border-t pt-4">
                          <Button
                            onClick={handleInstallGitHub}
                            variant="outline"
                            size="sm"
                          >
                            <Github className="mr-2 size-4" />
                            Add another installation
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {!canManageIntegrations && installations.length > 0 && (
            <p className="text-xs text-muted-foreground">
              You need admin permissions to manage integrations.
            </p>
          )}
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
