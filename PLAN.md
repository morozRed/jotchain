# JotChain PRD Alignment Plan

## Current Functionality (as-is)
- Work notes: TipTap editor, @mentions for projects/people, and recent entries per date on the Log page.
- Insights: user-triggered AI generation with templates, filters, quota, and history.
- Notifications: digest schedules with flexible recurrence and email summaries.
- Analytics: full dashboard with KPIs, charts, heatmap, and streaks (now moved to Settings).
- Billing: AI insights/digests gated; core logging free.
- **Signals**: passive pattern detection surfaced in collapsible bar on Log page.

## Target Outcomes (from PRD)
- ✅ Signals are derived patterns (blockers, time sinks, impact, wins, learnings) surfaced in a thin top bar.
- Reflection is optional and creates a normal note linked to a signal or entry.
- Insights are passive and text-first; no on-demand generation as primary UX.
- Notifications are minimal (optional EOD reminder, weekly nudge).
- ✅ Analytics is demoted to Settings -> Your data, not in primary nav.
- ✅ Notes are the source of truth; avoid streak pressure and task management framing.

## Product Framing (Passive signals)
- Passive sensing of work patterns, not manual reporting.
- Signals appear only when there is enough data, not on day one.
- Short, text-first feedback loops that lead to small adjustments.
- No shame, no streaks, no dashboards as the primary experience.

## Decisions Made
- **Signal scope**: One signal per type + entity (e.g., "Blocker: CI pipeline")
- **Detection method**: AI-powered from the start (no rules-only MVP)
- **Signal types**: blockers, time_sinks, impact, wins, learnings
- **Thresholds**: 3+ entries with pattern, 60+ confidence score
- **Model naming**: `WorkSignal` (to avoid conflict with Ruby's built-in `Signal` module)

## Gaps / Adjustments Needed
- ~~Missing data model for signals and signal entities; no signal state tracking.~~ ✅ Done
- InsightRequest is user-driven and central; must become background-only.
- NotificationSchedule UI is too complex for MVP; needs daily/weekly only.
- ~~Analytics is in main nav; should be hidden under Settings.~~ ✅ Done
- ~~UI copy and metrics still emphasize outputs (digests/insights/streaks).~~ ✅ Dashboard copy updated

## Signal Model (Implemented)
- `WorkSignal` (table: `signals`) - per user, per signal type + entity
  - Fields: `user_id`, `signal_type`, `entity_name`, `status`, `title`, `confidence`, `first_detected_at`, `last_detected_at`, `seen_at`, `source`, `metadata` JSONB, `context_payload` JSONB.
  - Unique index on `[user_id, entity_name, signal_type]`.
  - Statuses: active, ignored, acknowledged, resolved.
  - Sources: ai, rules.
- `SignalEntry` (join between signals and entries)
  - Fields: `signal_id`, `entry_id`, `role` (trigger/evidence/reflection), `excerpt`, `score`.
  - Unique index on `[signal_id, entry_id]`.
- `SignalEntity` (related entities extracted by AI)
  - Fields: `signal_id`, `entity_type` (project/person/topic/keyword), `name`, polymorphic `mentionable`, `count`, `last_seen_at`.
- Signal detection via `Signals::Detector` service
  - Analyzes last 14 days of entries using AI (gpt-5-mini).
  - JSON schema response format for structured output.
  - Auto-links detected entities to existing projects/persons.
- Signal surfacing via `Signals::Presenter` service
  - `surfaceable` scope: active + confidence >= 60 + entry_count >= 3.
  - Returns summary, counts by type, and signal list with entries/entities.

## Plan (Phased)

### Phase 0: Alignment ✅
1. ✅ Define signal thresholds (3+ entries, 60+ confidence).
2. ✅ Define evidence format and confidence rules for each signal type.
3. ✅ Align on the passive feedback loop (capture -> signal -> action -> reflection).
4. Confirm paid vs free gates (signals free, AI summaries paid).
5. ✅ Decide which legacy insight/digest surfaces remain visible for MVP.

### Phase 1: Data Model and Backend ✅
1. ✅ Add `signals`, `signal_entries`, and `signal_entities` tables with enums and indexes.
2. ✅ Implement type registry (`Signals::TypeRegistry`) for signal type config.
3. ✅ Add signal state fields (status, seen_at, last_detected_at, confidence, metadata).
4. ✅ Add `context_payload` for LLM reasoning storage.
5. Backfill signals from existing entries (deferred - detection runs on new entries).
6. ✅ Create signal detection service (`Signals::Detector`) with AI integration.
7. ✅ Create signal presenter service (`Signals::Presenter`) for frontend data.
8. ✅ Add API endpoints: GET /api/signals, PATCH /api/signals/:id, POST /api/signals/:id/add_entry.
9. ✅ Add background jobs: `Signals::DetectJob`, `Signals::ScanAllJob` (daily at 6am UTC).
10. ✅ Add debounced detection trigger in Entry model (1 hour cooldown).

### Phase 2: Log Page UX ✅
1. ✅ Add thin top bar (`SignalBar` component) on the Log page; collapsed by default.
2. ✅ Expand to show type filter pills and signal cards with evidence.
3. ✅ Add actions: Evidence (expand), Got it (acknowledge), X (ignore).
4. Add "Reflect on this" for individual entries (deferred).
5. ✅ Remove streak emphasis from dashboard; update copy to passive framing.

### Phase 3: Reframe Insights, Notifications, Analytics (Partial)
1. Move insights generation to a secondary location or background-only flow.
2. Trigger passive insights from signals rather than manual templates.
3. Simplify notifications UI to daily/weekly reminders (optional).
4. ✅ Move analytics to Settings -> Your data and remove from main nav.

### Phase 4: Copy and Metrics (Partial)
1. ✅ Update dashboard copy ("What happened today?", "Signals appear after a few days of notes").
2. Update landing page copy per copy.md.
3. Add instrumentation for key metrics: signals seen, expand rate, reflections created.
4. Provide admin task for signal recalculation to support iteration.

### Phase 5: Cleanup and Tests
1. Remove unused insight templates and analytics components from primary flows.
2. Add tests for signal detection and aggregation behavior.
3. Ensure billing gates keep signals free and AI summaries/digests paid.

## Open Questions (Resolved)
- ✅ What counts as "enough data" per signal type? → **3+ entries with pattern, 60+ confidence**
- ✅ Should signal detection be rules-only for MVP, or use AI immediately? → **AI from the start**
- ✅ How are signal entities created? → **AI extraction, auto-linked to existing projects/persons**
- What is the minimal reflection UX for MVP? → Deferred
- ✅ Should `context_payload` be stored vs computed? → **Stored (reasoning, keywords_found)**
- ✅ One signal per type, or per type + entity? → **Per type + entity**
- Which feedback concepts translate well? → TBD based on user testing

---

## Progress Log

### 2025-12-25: Initial Signals Implementation

**Backend (Complete)**
- Created 3 migrations: `signals`, `signal_entries`, `signal_entities`
- Created models: `WorkSignal`, `SignalEntry`, `SignalEntity`
- Updated `User` and `Entry` models with associations
- Created services:
  - `Signals::TypeRegistry` - signal type configuration
  - `Signals::Detector` - AI-powered pattern detection
  - `Signals::Presenter` - frontend data formatting
- Created background jobs:
  - `Signals::DetectJob` - per-user detection
  - `Signals::ScanAllJob` - daily batch scan (6am UTC)
- Added API controller: `Api::SignalsController`
- Added routes for signals CRUD

**Frontend (Complete)**
- Created `app/frontend/types/signals.ts` - TypeScript interfaces
- Created `app/frontend/components/signals/signal-bar.tsx` - collapsible signal bar
- Updated `app/frontend/pages/dashboard/index.tsx` - integrated SignalBar
- Updated dashboard copy to passive framing
- Moved Analytics from main nav to Settings → Your Data

**Fixes Applied**
- Renamed `Signal` → `WorkSignal` to avoid Ruby `Signal` module conflict
- Renamed `reflections` scope → `user_reflections` to avoid ActiveRecord conflict
- Fixed `surfaceable` scope to use subquery (allows eager loading)

**Files Created/Modified**
```
db/migrate/20251225125242_create_signals.rb
db/migrate/20251225125326_create_signal_entries.rb
db/migrate/20251225125401_create_signal_entities.rb
app/models/work_signal.rb
app/models/signal_entry.rb
app/models/signal_entity.rb
app/models/user.rb
app/models/entry.rb
app/services/signals/type_registry.rb
app/services/signals/detector.rb
app/services/signals/presenter.rb
app/jobs/signals/detect_job.rb
app/jobs/signals/scan_all_job.rb
app/controllers/api/signals_controller.rb
config/routes.rb
config/recurring.yml
app/frontend/types/signals.ts
app/frontend/components/signals/signal-bar.tsx
app/frontend/pages/dashboard/index.tsx
app/frontend/components/app-sidebar.tsx
app/frontend/layouts/settings/layout.tsx
```

**Deferred Work**
- Backfill signals from existing entries
- "Reflect on this" action for entries
- Simplify notifications UI
- Landing page copy updates
- Instrumentation and metrics
- Tests for signal detection
