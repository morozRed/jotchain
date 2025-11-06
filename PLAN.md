# Tiptap + Projects + AI Guidance Plan

Overall Progress: `0%`

## Tasks

- [ ] 🟥 Data Model Migration
  - [ ] 🟥 Add `projects` table (`user_id`, `name`, `normalized_name`, timestamps) with unique index on `[user_id, normalized_name]`
  - [ ] 🟥 Add `entry_projects` join table with unique composite index
  - [ ] 🟥 Update `entries`: drop `body` and `tag`, add `content:json`, add `quality_score:int`

- [ ] 🟥 Models & Associations
  - [ ] 🟥 `Project`: validations (presence, ≤120, disallow `@` and `/`), `before_validation` set `normalized_name`, `belongs_to :user`
  - [ ] 🟥 `Entry`: `has_many :projects, through: :entry_projects`, validate plain-text length derived from JSON (≤10,000)
  - [ ] 🟥 `EntryProject`: uniqueness validation on `[entry_id, project_id]`

- [ ] 🟥 Backend APIs & Routes
  - [ ] 🟥 `ProjectsController#index` (q contains, case-insensitive, limit 10)
  - [ ] 🟥 `ProjectsController#create` (validations + normalized uniqueness)
- [ ] 🟥 `AnalyticsController#create` → `{ tokens: [{text, reason}], quality_score }`
  - [ ] 🟥 `EntriesController#create` accepts JSON, extracts mentions, find-or-create projects, link join rows, enqueue scoring job
- [ ] 🟥 Wire routes for `projects`, `analytics`, and updated `entries`

- [ ] 🟥 Services & Jobs
  - [ ] 🟥 `Mentions::ExtractFromTiptap` (collect mention names, case-insensitive, dedupe)
  - [ ] 🟥 `Content::PlainText` (flatten Tiptap JSON to plain text)
- [ ] 🟥 `Analytics::Client` (OpenAI call, returns tokens + score)
  - [ ] 🟥 `EntryQualityScoreJob` (async compute and persist `quality_score`)

- [ ] 🟥 OpenAI Setup
  - [ ] 🟥 Add `ruby-openai` gem
  - [ ] 🟥 Configure credentials (`OPENAI_API_KEY`)
  - [ ] 🟥 Initializer for `gpt-4o-mini` defaults

- [ ] 🟥 Frontend Editor Integration
  - [ ] 🟥 Create `RichEditor` (Tiptap StarterKit + Mention), client-only mount guard
  - [ ] 🟥 Mention dropdown: prefetch projects, local filter, limit 10
  - [ ] 🟥 Show “+ add “{query}” project” only when no exact match; inexact matches remain selectable
  - [ ] 🟥 Explicit selection to finalize (Enter/Tab/Click); spaces allowed inside names
  - [ ] 🟥 Inline project chips via custom node view (Badge-consistent styling)

- [ ] 🟥 Guidance UI
- [ ] 🟥 “Get guidance” button → call `/analytics` with editor JSON
  - [ ] 🟥 Apply case-insensitive whole-word highlight decorations; tooltip on hover with reason
  - [ ] 🟥 Do not block submit

- [ ] 🟥 Prefetch Projects
  - [ ] 🟥 Prefetch all user projects on dashboard mount
  - [ ] 🟥 Local case-insensitive filtering; no server queries unless revisited later

- [ ] 🟥 Dashboard Adjustments
  - [ ] 🟥 Replace textarea with `RichEditor`; submit `entry[content]` (JSON)
  - [ ] 🟥 Recent entries: render plain text (from server) and project chips (associations)

- [ ] 🟥 Tests
  - [ ] 🟥 Models: project validations + normalized uniqueness; entry plain-text validator
  - [ ] 🟥 Requests: entries create (mentions new/existing), projects index/create
  - [ ] 🟥 Job: `EntryQualityScoreJob` updates `quality_score`
- [ ] 🟥 Analytics: stub OpenAI client; verify tokens and score shape
