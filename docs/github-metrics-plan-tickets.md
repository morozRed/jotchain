[DONE] GH-001 Define metrics + guardrails (throughput, cycle time, review load, stale PR thresholds) and document formulas
[DONE] GH-002 Define workspace roles + permissions (owner/admin/member) and expected access to team metrics
[DONE] GH-003 Create Workspace + WorkspaceMembership models/migrations
[DONE] GH-004 Backfill personal workspace + owner membership for existing users
[DONE] GH-005 Implement current_workspace selection + helper
[DONE] GH-006 Register GitHub App and store app credentials + webhook secret
[DONE] GH-007 Implement GitHub App install flow (redirect -> GitHub -> callback) with workspace association
[DONE] GH-008 Create GitHubInstallation + GitHubRepository models/migrations
[READY_TO_WORK] GH-009 Build repo selection UI for an installation and persist sync_enabled
[DONE] GH-010 Build GitHubService::Client with rate limit handling + retry strategy
[DONE] GH-011 Create GitHubContributor, GitHubCommit, GitHubPullRequest, GitHubReview, GitHubIssue models/migrations
[DONE] GH-012 Implement initial sync jobs for commits, PRs, issues, reviews (backfill)
[READY_TO_WORK] GH-013 Implement webhook endpoint for push, pull_request, pull_request_review, issues
[READY_TO_WORK] GH-014 Create GitHubMetricSnapshot model/migration
[READY_TO_WORK] GH-015 Build MetricsCalculator service to compute per-contributor and team metrics
[READY_TO_WORK] GH-016 Compute derived signals (stale PRs, review bottlenecks, uneven load, throughput drop)
[READY_TO_WORK] GH-017 Schedule hourly rolling metric updates and weekly snapshots
[READY_TO_WORK] GH-018 Implement team overview dashboard (who's working on what, signals)
[READY_TO_WORK] GH-019 Implement contributor profile view (active work, trends, review load)
[READY_TO_WORK] GH-020 Implement repo + project filtered views
[READY_TO_WORK] GH-021 Build Settings -> Integrations page (install/manage GitHub App)
[READY_TO_WORK] GH-022 Add project -> GitHub repo linking UI
[READY_TO_WORK] GH-023 Add contributor -> Person linking (private per user)
[READY_TO_WORK] GH-024 Add commit/PR detection in notes and contextual linking
[READY_TO_WORK] GH-025 Add weekly team summary email + optional alerts for stale work
[READY_TO_WORK] GH-026 Add instrumentation for dashboard/profile usage + cycle time trend tracking
[READY_TO_WORK] GH-027 QA pass on permissions, privacy boundaries, and data visibility
