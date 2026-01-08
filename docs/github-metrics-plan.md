# GitHub Team Visibility Implementation Plan

## Overview
Add GitHub integration to provide team visibility into who is working on what and how productive the team is. GitHub data is shared at the workspace level, while notes and signals remain user-private and optional.

## Product Goals
- Show active work by contributor and repo
- Surface productivity signals (throughput, review load, cycle time)
- Highlight bottlenecks (stale PRs, delayed reviews)
- Allow optional private notes for context without forcing reporting

## Guardrails / Non-Goals
- Not a task manager or replacement for Linear/Jira
- Avoid a single productivity score as the primary view
- Default to trends and context, not surveillance
- Private notes never become team-visible data

## Key Design Decisions
- GitHub App authentication (install on org/repos)
- Team dashboard is a primary surface
- Workspace-shared: GitHub installations, repos, commits, PRs, issues, reviews, metrics, GitHubContributors
- User-private: Entries (notes), Signals, Persons, Projects (unchanged)
- Per-user linking: each user links GitHubContributors -> their own Person records
- Multiple repos per project supported (user's project links to shared repos)
- Rolling windows (7/14/30 days) + weekly historical snapshots

---

## GitHub Metrics to Fetch

### Core Activity Metrics
| Metric | Source | Purpose |
|--------|--------|---------|
| **Commits** | Commits API + push webhooks | Volume, LOC added/deleted, recency |
| **Pull Requests** | PRs API + pull_request webhooks | Opened, merged, age, cycle time |
| **Code Reviews** | Reviews API + pull_request_review webhooks | Review load, turnaround time |
| **Issues** | Issues API + issues webhooks | Work items, participation |

### Work in Progress Visibility
- Open PRs by contributor and repo
- PR age and last activity timestamp
- Recent commits (last 7/14/30 days)
- Active repos per contributor

### Derived Metrics (Per Contributor)
- **Throughput**: Merged PRs per period
- **Cycle time**: Time from PR open to merge
- **Review turnaround**: Time from PR open to first review
- **Review load**: Reviews given vs. reviews received
- **Work in progress**: Open PR count and average age
- **Focus areas**: Top repos by activity

### Activity Patterns (Optional)
- Day-of-week distribution
- Hour-of-day distribution
- Consistency over time

### Aggregate Team Metrics
- Total commits/PRs/reviews per period
- Review backlog and stale PR count
- Team cycle-time distribution
- Repo activity breakdown
- Optional top contributors view (throughput or review load)

### Signals (Derived)
- Stale PRs with no review activity
- Review bottlenecks (PRs waiting beyond threshold)
- Uneven review load across contributors
- Throughput drops vs. prior period

---

## Data Model

### New Models

```
Workspace (team container for shared GitHub data)
├── id, name, slug, owner_id, settings (jsonb)
├── has_many :workspace_memberships
├── has_many :members (through memberships)
├── has_many :github_installations
├── has_many :github_contributors

WorkspaceMembership
├── workspace_id, user_id, role (owner/admin/member)

GitHubInstallation
├── workspace_id, installation_id (GitHub's ID)
├── account_login, account_type (Org/User)
├── permissions (jsonb), suspended_at
├── has_many :github_repositories

GitHubRepository
├── github_installation_id
├── github_id, name, full_name, private, default_branch
├── sync_enabled, last_synced_at
├── has_many :github_commits, :github_pull_requests, :github_issues

ProjectRepository (join table for user Projects -> shared GitHubRepositories)
├── project_id, github_repository_id
├── Unique constraint: [project_id, github_repository_id]

GitHubContributor (workspace-shared)
├── workspace_id
├── github_id, login, name, avatar_url, email
├── has_many :github_contributor_links

GitHubContributorLink (per-user linking)
├── user_id, github_contributor_id, person_id
├── Unique constraint: [user_id, github_contributor_id]
├── Each user maps contributors to THEIR OWN Person records

GitHubCommit
├── github_repository_id, author_id (GitHubContributor)
├── sha, message, committed_at
├── additions, deletions, files_changed

GitHubPullRequest
├── github_repository_id, author_id
├── github_id, number, title, state (open/closed/merged)
├── additions, deletions, opened_at, closed_at, merged_at, first_review_at
├── has_many :github_reviews

GitHubReview
├── github_pull_request_id, reviewer_id (GitHubContributor)
├── state (approved/changes_requested/commented), submitted_at

GitHubIssue
├── github_repository_id, author_id
├── github_id, number, title, state, opened_at, closed_at

GitHubMetricSnapshot
├── workspace_id, github_contributor_id (optional)
├── period_type (rolling_7d/14d/30d/weekly), period_start, period_end
├── metrics (jsonb), computed_at
```

### Migration Strategy
1. Create Workspace + WorkspaceMembership for each existing user (as owner)
2. Person, Project, Entry, Signals remain user-scoped (no changes needed)
3. GitHubContributorLink allows per-user linking of shared contributors to private Persons
4. User's Projects can reference shared GitHubRepositories via a join table

---

## Implementation Phases

### Phase 1: Workspace Foundation
- [ ] Create Workspace, WorkspaceMembership models/migrations
- [ ] Create personal workspace + owner membership for each existing user
- [ ] Add a minimal path to add additional members (feature-flagged or admin-only) so workspaces can be shared
- [ ] Define current_workspace selection when a user has multiple memberships
- [ ] Add current_workspace helper (for GitHub data access)
- [ ] Person/Project stay user-scoped (no changes needed)

### Phase 2: GitHub App Setup
- [ ] Register GitHub App (needs manual step in GitHub)
- [ ] Create GitHubInstallation model
- [ ] Implement install flow (redirect -> GitHub -> callback)
- [ ] Create GitHubRepository model
- [ ] Build Settings/Integrations page

### Phase 3: GitHub Data Sync
- [ ] Create GitHubContributor, GitHubCommit, GitHubPullRequest, GitHubReview, GitHubIssue models
- [ ] Build GitHubService::Client with rate limit handling
- [ ] Implement initial sync jobs (commits, PRs, issues)
- [ ] Set up webhook endpoint for real-time updates
- [ ] Add contributor -> Person linking (optional)

### Phase 4: Metrics and Signals
- [ ] Create GitHubMetricSnapshot model
- [ ] Build MetricsCalculator service (compute metrics + signals)
- [ ] Schedule hourly rolling metric updates
- [ ] Schedule weekly snapshot creation

### Phase 5: UI
- [ ] Team Overview dashboard (who's working on what, signals)
- [ ] Contributor profile view
- [ ] Repo and project filtered views
- [ ] Settings/Integrations page (install GitHub App)

---

## Key Files to Create

**Models:**
- `app/models/workspace.rb`
- `app/models/workspace_membership.rb`
- `app/models/github_installation.rb`
- `app/models/github_repository.rb`
- `app/models/github_contributor.rb`
- `app/models/github_contributor_link.rb` (per-user linking to Person)
- `app/models/project_repository.rb` (user's Project -> shared GitHubRepository)
- `app/models/github_commit.rb`
- `app/models/github_pull_request.rb`
- `app/models/github_review.rb`
- `app/models/github_issue.rb`
- `app/models/github_metric_snapshot.rb`

**Services:**
- `app/services/github_service/client.rb`
- `app/services/github_service/commit_syncer.rb`
- `app/services/github_service/metrics_calculator.rb`

**Controllers:**
- `app/controllers/github_app_controller.rb`
- `app/controllers/webhooks/github_controller.rb`
- `app/controllers/api/github_metrics_controller.rb`
- `app/controllers/settings/integrations_controller.rb`

**Frontend:**
- `app/frontend/pages/settings/integrations/index.tsx`
- `app/frontend/pages/team/metrics/index.tsx`
- `app/frontend/pages/team/metrics/[contributorId].tsx`

**Files to Modify:**
- `app/models/person.rb` - Add has_many :github_contributor_links
- `app/models/project.rb` - Add has_many :project_repositories (join to shared repos)
- `app/models/user.rb` - Add workspace membership associations
- `config/routes.rb` - Add GitHub and team routes

---

## Linking GitHub to Notes (Optional)

### Per-User Contributor Linking
Each user can link GitHubContributors to their own Person records via `GitHubContributorLink`:
- UI: In team metrics view, click a contributor -> "Link to Person" -> select from your Persons
- This is private - other team members do not see your Person names
- Enables correlation between your notes and their GitHub activity

### Once Linked
1. **Entry view**: When you mention a Person linked to a contributor, show their recent GitHub activity
2. **Person view**: Show both your notes mentioning them and their GitHub metrics
3. **Commit/PR detection**: Parse entry text for commit SHAs or PR numbers -> link to GitHub data
4. **Activity correlation**: "You wrote about @John 5 times when he was working on the auth PR"

### Project-Repository Linking
Each user can link their private Projects to shared GitHubRepositories:
- UI: In project settings -> "Link GitHub Repos" -> select from connected repos
- Enables project-scoped metrics (filter metrics by project = filter by linked repos)
