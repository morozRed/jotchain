## JotChain PRD - Team Visibility with GitHub + Context Notes (Rails + Inertia)

### Problem

Engineering leaders and teams lack low-effort visibility into who is working on what and how the team is progressing.

Standups and status updates are manual and inconsistent. GitHub data is rich but noisy and hard to interpret. Teams need productivity signals without forcing a new workflow.

---

### Solution

A team visibility layer that connects GitHub activity with optional private notes.

JotChain shows active work, review load, throughput, and cycle-time trends while letting individuals add context when needed. It complements existing planning tools instead of replacing them.

---

## Product Principles

* **Team visibility without surveillance**
* **Context over raw counts**
* **Productivity is multi-dimensional**
* **Private notes stay private by default**
* **Integrate with Linear/Jira, do not replace them**
* **Insights must be actionable**

---

## MVP Scope (Aligned)

### 1) GitHub Integration (Core)

* GitHub App install (org/repo)
* Repo selection and sync
* Contributor mapping to team members

---

### 2) Team Overview (Core)

* "Who's working on what" (active PRs, recent commits, top repos)
* Review load and response time
* Throughput and cycle-time trends (7/14/30 days)

---

### 3) Contributor Profiles (Core)

* Active work, recent PRs, review activity
* Focus areas by repo
* Trends over time

---

### 4) Project/Repo Mapping (Core)

* Link GitHub repos to projects
* Filter team metrics by project

---

### 5) Notes and Context (Optional)

* Private notes remain the source of personal context
* Link notes to people, projects, PRs, or commits

---

### 6) Signals and Alerts (Core)

Signals are derived patterns from GitHub activity that highlight team health and bottlenecks.

* Stale PRs and long review waits
* Uneven review load
* Sudden drops in throughput

Signals surface in the team dashboard and can link to optional private notes.

---

### 7) Notifications (Optional)

* Weekly team summary
* Optional nudges for stale work

---

## Auth and Billing (Updated)

Billing gates:

* Advanced analytics (longer history, exports)
* Alerts and scheduled reports
* Larger org and multi-team workspaces

Core team visibility should be usable with minimal setup.

---

## Revised Team Journey (Aligned)

1. Install the GitHub App and select repos
2. Team dashboard shows who is working on what
3. Drill into a contributor or repo
4. Add private notes for context (optional)
5. Signals highlight bottlenecks and review load
6. Weekly summary reinforces trends

---

## Core Data Model (Updated)

### Keep

* `entries`
* `projects`
* `persons`
* `entry_mentions`

### Add

* `workspaces`
* `workspace_memberships`
* `github_installations`
* `github_repositories`
* `github_contributors`
* `github_commits`
* `github_pull_requests`
* `github_reviews`
* `github_issues`
* `github_metric_snapshots`
* `project_repositories`

### Reframe

* `signals` become team productivity signals derived from GitHub data
* Notifications become team summaries and alerts

---

## Success Metrics (Re-aligned)

### Primary

* GitHub App installs per team
* Active repos with successful sync
* Team dashboard visits
* Contributor profile views
* Reduced PR cycle time or review lag

### Secondary

* Optional note usage linked to PRs/people
* Weekly summary opens
* Conversion to paid

---

## What This Changes in Practice

You are no longer selling:

> "A private work journal"

You are selling:

> **"Know who's working on what and how the team is moving."**

Notes become context, not the main product.

---

## Final Thought

This revised PRD:

* Positions JotChain as a team visibility layer
* Aligns GitHub metrics with productivity goals
* Keeps optional notes for context without forcing reporting
