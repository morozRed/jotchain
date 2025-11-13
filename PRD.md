## JotChain PRD — App Alignment (Rails + Inertia)

### Problem
Engineers and managers waste time before stand‑ups, syncs, and reviews trying to recall what they did. Manual prep is tedious and often skipped.

### Solution
Log entries as you work, tag projects/people inline, generate on‑demand insights, and schedule AI email digests ahead of meetings. Billing gates advanced features.

---

## What Exists Today

- Entries
  - TipTap editor with inline @‑mentions for projects and people
  - Create new projects/people on the fly from the mention menu
  - Daily entries list with basic stats (count, current streak)

- Insights (on‑demand AI)
  - Templates: summary, tweets, review, blog, update, ideas, custom
  - Filter by date range and projects; live preview of matching data (total notes, project breakdown, top collaborators)
  - Generate, poll status, view/edit content; show project breakdown when present

- Notifications (scheduled digests)
  - Flexible schedules: timezone, time of day, recurrence (daily/weekly/monthly/custom), lookback window, lead time
  - Upcoming occurrences preview and delivery history
  - Email digests generated via AI with sections and source entries

- Analytics
  - KPIs + trends, heatmap, hour/day distributions, project donut, top people
  - Filter by project and range (week/month/year); deep link to dashboard

- Auth & Billing
  - Email/password auth + Google OAuth
  - Stripe subscriptions with trial, cancel/reactivate, plan switch
  - Feature gating: notifications and insights require active subscription or trial

- Settings & PWA
  - Profile, password, email, active sessions
  - Manifest served; Inertia + Vite‑powered React frontend

---

## MVP Scope (Aligned)

1) Log entries with @‑mentions
   - Inline creation of projects/people; mentions are persisted and used in analytics/insights

2) On‑demand Insights
   - Date/project filters, live preview, template selection, status polling, editable content

3) Scheduled Notifications
   - Create schedules with cadence, lookback, lead time; email delivery with AI summary

4) Analytics Overview
   - Trends and breakdowns; project/people insights and “needs attention” lists

5) Auth + Billing
   - Email + Google auth; Stripe subscription management; feature gates

---

## Tech Stack

- Backend: Ruby on Rails 7, Postgres (primary), Active Job (SQLite queue in dev/test)
- Frontend: Inertia + React + TypeScript (Vite), shadcn/ui
- AI: OpenAI‑compatible Chat Completions via `Ai::Client` with fallback model support
- Email: Action Mailer for digest delivery
- Scheduling: `NotificationSchedules::ScanJob` creates `NotificationDelivery` jobs with summary windows + lead times
- Payments: Stripe (checkout, portal, plan switch, webhooks)
- Deployment: Kamal; PWA manifest served from Rails
- Marketing: Astro landing site in `landing_page/`

---

## Core Data Model (High‑level)

- User has many: `entries`, `notification_schedules`, `notification_deliveries`, `insight_requests`, `projects`, `persons`
- Entry: encrypted body (TipTap JSON), `logged_at`, mentions via polymorphic `EntryMention` to `Project`/`Person`
- InsightRequest: `query_type`, date range, selected `project_ids`/`person_ids`, `status` with `result_payload` and editable `content`
- NotificationSchedule: cadence settings, timezone, lookback, lead time; generates `NotificationDelivery` with window and trigger time

---

## User Flows

- Log an entry
  - Type in TipTap, use `@` to mention projects/people; create entities inline if needed; Save

- Generate an insight
  - Pick date range/projects → preview appears → select template → generate → poll → open result → copy or edit content

- Configure emails
  - Create a schedule (timezone, recurrence, lookback, lead time) → preview next occurrences → emails deliver around lead time

- Explore analytics
  - Switch range/project → review KPIs, charts, project/people breakdowns; click areas to jump to dashboard filters

- Manage subscription
  - Upgrade (monthly/yearly), switch, cancel/reactivate; trial gating applied to notifications/insights

---

## Success Metrics (Near‑term)

- Entries per active user (weekly)
- % of entries with at least one @‑mention
- Insights generated per subscriber; completion vs. failure
- Notification deliveries (delivered vs. skipped/failed)
- Trial conversion, plan changes (monthly ↔ yearly)

---

## Future (Out of Scope for Current App)

- Smart Writing Coach (real‑time scoring and suggestions)
- GitHub integration and performance review generator
- Slack/calendar integrations, exports, team workspaces, Jira/Linear

---

## Notes

- PRD aligned to the Rails app under `backend/` with Inertia React frontend in `backend/app/frontend/` and Astro landing in `landing_page/`.
- Notifications and Insights are subscription‑gated per current controllers and jobs.
