## JotChain PRD — Journaling with Signals (Rails + Inertia)

### Problem

Engineers and tech leads *lose visibility into their real work*.

Interruptions, blockers, helping others, and context switching rarely make it into task tools — so weeks feel exhausting, reviews feel fuzzy, and teams repeat the same problems without understanding why.

Most tools optimize **planning** or **reporting**.
Very few help people **notice patterns in what actually happened**.

---

### Solution

A lightweight work journal that turns short notes into **ambient signals** about blockers, time sinks, and impact.

Users write freely.
JotChain observes quietly.
Insights appear only when patterns emerge.

No planning. No task management. No dashboards by default.

---

## Product Principles (New)

* **Notes are the source of truth**
* **Insights are earned, not demanded**
* **Reflection is optional, never required**
* **Text first, visuals second**
* **No shame, no streak pressure**
* **Never compete with Linear / Jira**

---

## MVP Scope (Re-aligned)

### 1) Work Notes (Core)

* Single writing surface: *“What happened today?”*
* Free-text journaling (TipTap stays)
* Inline `@mentions` for people and projects (optional)
* Notes auto-saved on submit
* Recent notes visible for memory anchoring

> Writing must take <30 seconds.

---

### 2) Signals (NEW CORE CONCEPT)

Signals are **derived patterns**, not user input.

#### Initial signal types

* **Blockers**
* **Time sinks**
* **Impact / Invisible work** (helping, unblocking, mentoring)

#### Behavior

* Signals appear in a **thin top bar**
* Collapsed by default
* Expand via click (slider / toggle)
* Only appear once enough data exists

Example:

```
▸ Blockers (3)
▸ Time sinks
▸ Impact
```

Expanded:

```
▾ Blockers (3)
CI pipeline — mentioned 2×
Waiting on review — 1×

[ Reflect ]   [ Ignore ]
```

---

### 3) Reflection (Optional, Contextual)

Reflection is **user-initiated**, never forced.

Ways to reflect:

* From a signal slider (“Reflect”)
* From a specific note (“Reflect on this”)

Reflection is just… another note:

* Linked to the signal
* No special UI
* No required outcome

---

### 4) Insights (Reframed)

❌ Remove “on-demand insight generation” as primary UX
✅ Replace with **passive insight surfacing**

#### Insight rules

* Appear only after patterns emerge
* Text-first
* No charts on load
* No templates to choose from

Example insight copy:

> “This week felt fragmented — interruptions appeared in 4 notes.”

Advanced AI summaries remain **secondary** (see below).

---

### 5) Notifications (Reframed)

Notifications are **nudges**, not reports.

#### MVP notifications

* End-of-day gentle reminder (optional)

  > “Want to capture today while it’s fresh?”
* Weekly reflection nudge

  > “A few patterns stood out this week.”

❌ Remove complex schedules from MVP UI
❌ Remove “digest as core value”

Emails become:

* Optional
* Summary-oriented
* Secondary to in-app insight

---

### 6) Analytics (Demoted)

Analytics are **not the aha moment**.

For MVP:

* No dashboards on first run
* No heatmaps by default
* No KPI screens in primary nav

Analytics can live under:

> Settings → “Your data”

Later used for:

* Power users
* Retros
* Teams

---

### 7) Auth & Billing (Unchanged, but reframed)

Billing gates:

* Advanced AI insights (summaries, exports)
* Email digests
* Team workspaces (future)

Core journaling + basic signals must remain:

> **usable without payment**

This builds trust.

---

## Revised User Journey (Aligned)

1. User writes notes for a few days
2. Nothing happens immediately
3. A signal appears quietly
4. User clicks out of curiosity
5. Insight explains *how the week felt*
6. User reflects
7. Habit forms

That’s the loop.

---

## Core Data Model (Adjusted)

### Keep

* `entries`
* `projects`
* `persons`
* `entry_mentions`

### Add

* `signals`

  * `signal_type` (blocker, time_sink, impact)
  * `confidence`
  * `evidence`
  * `entry_id`
* `signal_entities` (cause/target like CI, person, system)

### Reframe

* `InsightRequest` → background system process, not user-triggered UI
* `NotificationSchedule` → simplified (daily / weekly only for MVP)

---

## Success Metrics (Re-aligned)

### Primary

* Entries per user per week
* % of users who see at least one signal
* Signal expansion rate (clicks)
* Reflection notes created

### Secondary

* Email digests opened
* AI summaries generated
* Conversion to paid

If users don’t **see themselves** in the signals, nothing else matters.

---

# 3️⃣ What This Changes in Practice

### You are no longer selling:

> “Prepare for standups and reviews”

You are selling:

> **“Understand where your time and energy actually go.”**

Standups, reviews, and emails become **side effects**, not the product.

---

## Final thought (important)

This revised PRD:

* Keeps your current tech viable
* Explains *why* JotChain exists alongside Linear
* Creates a defensible UX moat
* Aligns perfectly with the “Amy food journal” model

If you want next, I can:

* Map **old features → new mental buckets**
* Propose a **migration plan** (no big bang)
* Rewrite homepage copy to match this PRD
* Help you decide **what to delete** (hard but necessary)

This is the right direction.
