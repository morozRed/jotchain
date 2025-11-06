# Insights Plan (MVP)

This document defines the first version of the Insights screen: the user experience, the components we will build, the data contract returned by the API, and high‑level backend/frontend implementation notes. Scope is intentionally tight: no comparisons, no saved views, no digests. The goal is a useful, engaging, fast insights page that drives habit formation and highlights where attention goes.

## UX Summary

- Layout
  - Top filter bar: Project selector (All or a specific project) and range tabs (Week, Month, Year). Optional custom dates are out‑of‑scope for MVP.
  - KPI cards row (6 cards): Totals and habit health at a glance.
  - Charts and lists: Activity timeline and heatmap are primary; supporting distributions and breakdowns follow.
  - Drill‑down: Clicking any chart element (day, hour, DOW, project, person) opens the entries view with corresponding filters pre‑applied.

- Visual & Interaction
  - Use existing Tailwind system + chart color tokens, support dark mode.
  - Micro-interactions: Hover tooltips with exact counts and percentages; faint peak highlights on charts.
  - Accessibility: Keyboard focus for filters and chart elements; colorblind‑safe palettes; text equivalents for card metrics.
  - Zero‑data state: Show a compact placeholder with two suggested next actions (e.g., “Add your first entry”, “Tag a project”).

- Responsiveness
  - Mobile: Stack filters, then 2×3 grid for KPI cards, then charts one per row with simplified legends.
  - Desktop: 3×2 KPI cards; two columns of charts where appropriate.

## Key Components & Acceptance Criteria

### Filters
- Elements: Project selector (All/specific), Range tabs (Week/Month/Year), implicitly use user timezone.
- Behavior: Changing filters refetches data; state persists in URL query (`/insights?project_id=&range=month`).
- Accept: API called with selected filters; UI reflects active filter; keyboard accessible.

### KPI Cards (6)
1) Total Entries
   - Count of entries in selected period (and project filter if applied).
2) Active Days
   - Number of days with ≥1 entry in period.
3) Current Streak
   - Consecutive active days up to today (or up to the end of range if it ends before today).
4) Longest Streak
   - Maximum consecutive active days (lifetime or within range; MVP: lifetime).
5) Avg per Active Day
   - `total_entries / active_days` (show to one decimal if fractional).
6) Focus Score
   - Concentration across projects: compute Herfindahl index of project shares within range, scaled 0–100 (higher = more focused).

Accept: Values render within 200ms after data load; tooltips define each metric; dark mode OK.

### Activity Timeline (Primary)
- Daily counts for the selected range using user timezone bucketed by local date.
- Optional rolling 7‑day average overlay for Month/Year ranges.
- Click a day to open entries filtered to that date (and current project filter).
Accept: Correct bucket counts; tooltip shows date and exact count; rolling overlay can be toggled on/off.

### Heatmap Calendar (Primary)
- Month grid for the visible range (Week shows the containing month; Month shows its month; Year shows a 12×7 calendar matrix by week).
- Color intensity reflects daily count; clicking a day drills down.
Accept: Accurate mapping of dates to cells in user timezone; legend for min/max intensity.

### Hour of Day Chart
- 24‑hour distribution (0–23) in user timezone.
- Highlights peak hour and quiet hour in tooltip or caption.
Accept: Sum equals total entries; click an hour opens entries filtered to that hour across the period.

### Day of Week Chart
- Distribution from Monday (1) to Sunday (7) using ISO DOW.
- Shows share of total; optional caption “Best day: <Day>”.
Accept: Sum equals total entries; click a day opens entries for that weekday across the range.

### Project Breakdown Donut
- Top N projects (default N=10) with counts and share; aggregate the rest as “Other”.
- Multi-select is out-of-scope; single click drills down to entries for that project (maintain active range).
Accept: Shares sum to 100%; labels don’t overlap; “Other” shows when there are more than N projects.

### Top People Bar
- Top N mentioned people with counts.
- Click to drill into entries mentioning that person.
Accept: Correct counts based on mentions; cap N=10; provide “See all” link if API indicates pagination.

### Needs Attention List
- Show up to 3 stale projects: `{name, daysSinceLast}` sorted by daysSinceLast desc.
- Show % untagged entries (no project assigned) in the period.
Accept: Items correctly reflect the range; clicking a stale project drills into that project’s entries; clicking untagged opens entries missing a project.

## API Shape (InsightsData)

Endpoint: `GET /api/insights?range=week|month|year&project_id=<id|null>&tz=<IANA>`

Response JSON (MVP):
```json
{
  "meta": {
    "range": "week",
    "projectId": null,
    "tz": "America/Los_Angeles",
    "from": "2025-02-01",
    "to": "2025-02-28"
  },
  "cards": {
    "totalEntries": 42,
    "activeDays": 18,
    "currentStreak": 5,
    "longestStreak": 12,
    "avgPerActiveDay": 2.3,
    "focusScore": 74,
    "untaggedShare": 0.08
  },
  "activity": [{ "date": "2025-02-01", "count": 3 }],
  "rolling7": [{ "date": "2025-02-07", "count": 2.6 }],
  "heatmap": [{ "date": "2025-02-01", "count": 3 }],
  "hourly": [{ "hour": 9, "count": 7 }],
  "dow": [{ "isoDow": 1, "count": 12 }],
  "projects": {
    "top": [{ "id": 1, "name": "Alpha", "count": 10, "share": 0.24 }],
    "otherCount": 8,
    "focusScore": 74,
    "stale": [{ "projectId": 3, "name": "Gamma", "daysSinceLast": 19 }]
  },
  "people": {
    "top": [{ "id": 9, "name": "Sam", "count": 6 }],
    "otherCount": 5
  },
  "needsAttention": {
    "staleProjects": [{ "projectId": 3, "name": "Gamma", "daysSinceLast": 19 }],
    "untaggedShare": 0.08
  }
}
```

Notes:
- `rolling7` is optional; include for Month/Year ranges only.
- All dates are ISO local dates per `tz` (no timestamps at midnight UTC).
- `share` values are 0–1 floats; `focusScore` is 0–100 integer.

## Backend Implementation Notes

- Controllers & Routes
  - `GET /insights` (Inertia page)
  - `GET /api/insights` responds with the JSON shape above; query params: `range`, `project_id`, `tz`.

- InsightsCalculator Service
  - Inputs: `user_id`, `range`, `project_id`, `tz`.
  - Outputs: All aggregates above. Limit top lists to N=10 and return `otherCount`.
  - Timezone‑safe bucketing: Use Postgres `date_trunc` with timezone conversion (e.g., `date_trunc('day', (logged_at at time zone 'UTC') at time zone :tz)`), and similar for hour (extract hour after shifting to `:tz`).
  - Streak logic: Sort local dates; current streak is consecutive days up to `today in tz`.
  - Focus score: For project shares `p_i`, compute `H = sum(p_i^2)`, then `score = round(100 * H)`.

- Indexing & Performance
  - Composite indexes: `entries (user_id, logged_at)`; `entry_projects (user_id, project_id, logged_at)`; `entry_people (user_id, person_id, logged_at)`.
  - Consider partial indexes for recent time windows if data is large.
  - Pagination caps: `top` lists capped at 10; provide `otherCount` to avoid heavy payloads.
  - Caching: Per‑user + filter key (e.g., `insights:v1:{user}:{range}:{project}`) with 5–10 min TTL; invalidate on create/update of entries or tags.

- Security
  - Scope all queries by `user_id`/`account_id` (multi‑tenant safety). Return only entities the user can access.

## Frontend Implementation Notes

- Packages: `recharts` for charts; reuse Tailwind + theme tokens.
- Page: `app/frontend/pages/insights/index.tsx` loads data via `GET /api/insights` and renders sections.
- Components
  - `FilterBar` (project select + range tabs)
  - `KpiCards` (6 cards)
  - `ActivityLineChart` (with optional rolling toggle)
  - `HeatmapCalendar`
  - `HourOfDayChart`
  - `DayOfWeekChart`
  - `ProjectDonut`
  - `TopPeopleBar`
  - `NeedsAttentionList`
- Types: Define `InsightsData` and nested interfaces per API shape above.
- Drill‑downs: Use existing routes for entries list with appropriate query params.

## Out of Scope (MVP)

- Period comparisons (WoW/MoM/YoY), saved views, email digests, shareable images, anomaly detection, network graphs, multi‑select overlays.

## QA & Edge Cases

- Timezones & DST: Verify bucketing across DST changes; test non‑UTC timezones.
- Zero‑data: Ensure friendly placeholders and no divide‑by‑zero (e.g., `avgPerActiveDay` when `activeDays=0`).
- Large categories: Validate `Other` aggregation and that legends remain legible.
- Accessibility: Keyboard navigation through filters and focusable chart segments.

## Do We Need AI?

- Short answer: No, not for MVP. All listed insights are standard aggregations and streak calculations that are efficiently computed with SQL and lightweight service logic.

- Where AI could add value later (optional):
  - Summaries: Generate human‑readable weekly highlights from aggregates.
  - Topic extraction: Auto‑tag entries by themes to improve project/person coverage.
  - Anomaly explanations: When spikes occur, suggest likely causes based on entry text.
  - Natural language queries: “Show my busiest mornings last month.”

The MVP should ship with database queries only—simpler, faster, cheaper—and reserve AI for additive features.

