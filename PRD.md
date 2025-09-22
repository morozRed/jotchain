Product Requirements Document (PRD)
Product: JotChain
A lightweight, privacy-first web app for daily work journaling, context handover, and professional growth tracking.

1. Objective
Build a secure, simple tool where users can log what they did, what they'll do next, and their wins, while enabling them to:

Maintain continuity between work sessions with intelligent context recall
Track and showcase professional wins for career growth
Build consistent habits through visual streaks
Keep all data encrypted at rest in the database for privacy
Export wins for performance reviews and job applications


2. Target Users

Individual developers & professionals who need daily context switching
Privacy-conscious knowledge workers who want secure journaling
Career-focused individuals building a portfolio of achievements
Remote workers who need to track daily accomplishments
Small teams who need lightweight async handoffs (future)


3. Core Value Propositions

"Your notes are everywhere, your context is nowhere" - Intelligent context recall with secure storage
"Your wins, ready for reviews" - One-click formatted exports
"Truly private" - Data encrypted at rest in the database
"Build momentum" - Visual streaks and habit tracking
"Works instantly" - No app download, fast web experience
"AI-powered insights" - Generate actionable content and summaries from your journals (Pro tier)


4. Key Assumptions

Market demand for privacy-focused journaling tools remains high in 2025, with users prioritizing secure storage over feature-rich alternatives like Notion.
xAI Grok API (v4) costs will be manageable (~$0.01-0.05 per insight generation, based on 2025 pricing), with volume discounts for scale.
Users will convert to Pro at 5% rate due to hitting retention limits and needing unlimited access/AI.
Development timeline assumes a small team (2-3 devs) with Rails expertise; total MVP cost ~$50K (including audit and hosting).


5. MVP Features (Launch Ready)
5.1 Authentication

OAuth (Google/GitHub)
Email/password signup
Secure session management with auto-lock

5.2 Entry System

Quick Capture Mode: Single field with natural language for day log, next actions, or win
Structured Mode: Split "Day Log" / "Next Actions" / "Win" sections
Markdown support with live preview
Auto-save every 10 seconds to local storage
Custom Categories: Users can create, edit, and delete custom categories for organizing entries (e.g., "1-1 Meetings", "Side Projects"). Each entry is assigned to one category. Defaults: "Personal" and "Work" (removable by user). Category management via dashboard settings.

5.3 Context Display

Previous Entry card shown on homepage (your last entry, whenever it was)
Recent entries list (last 6 entries)
"Continue from previous" quick action to carry over unfinished items
Collapsible cards to reduce clutter
Filter recent entries by category

5.4 Streak Visualization

Vertical calendar heatmap (mobile-optimized)
Current streak with subtle animation
Best streak achievement display
Activity intensity based on completeness
Streaks per category (if multiple categories used)

5.5 Wins System (Simplified)

Users enter wins directly in the "Win" section of the entry system
No importance levels - all wins treated equally
One-click copy as formatted text for reviews/LinkedIn
Wins dashboard with simple list view and date-based filtering
Export wins as markdown
Filter wins by category

5.6 Navigation

Calendar date picker to jump to any date
Previous/Next day arrows
Keyboard shortcuts (Cmd+N new, Cmd+Enter save)
Today button to return to current date
Category selector dropdown in navigation bar

5.7 Data & Security

Database encryption using Lockbox or similar for at-rest protection
Recovery phrase during signup (optional for account recovery)
4-day retention for free tier with clear countdown
Export all data as JSON or markdown (including categories)

5.8 AI Insights (Pro Tier)

Dashboard card on main screen for generating AI insights
Availability: Shown only if user has sufficient entries (e.g., at least 7 days)
Generation options (selectable dropdown): Prepare for daily call, Generate ideas for X posts, Generate ideas for blog posts, Generate ideas for LinkedIn posts, Summarize wins
Timeframe selector (dropdown): Last week, Last month, Last 3 months, Last 6 months, Last year, All time
Process: Opt-in feature; selected entries sent to Grok AI (via xAI API) for processing; results returned and displayed in a modal or expandable section; no data stored by AI service
Output: Generated text based on user's entries, with copy/export buttons
Option to filter insights by category


6. UI Design System
Color Palette
/* Slate blue base with vibrant teal and coral accents for a modern, professional look */
--background-primary: #1E293B /* Deep slate blue */
--background-secondary: #334155 /* Mid-tone slate */
--background-tertiary: #475569 /* Light slate */

/* Primary Accent - Vibrant Teal */
--accent-primary: #2DD4BF
--accent-hover: #5EEAD4
--accent-muted: #2DD4BF20
--accent-glow: 0 0 15px #2DD4BF30

/* Secondary Accent - Coral */
--accent-secondary: #F472B6
--accent-secondary-hover: #F9A8D4

/* Text Colors */
--text-primary: #F8FAFC
--text-secondary: #CBD5E1
--text-tertiary: #94A3B8

/* Semantic Colors */
--success: #34D399 /* Streaks */
--wins: #2DD4BF /* Unified win color */
--ai-insights: #F472B6 /* AI feature accents */

Typography

Headers: Roboto Mono (modern, clean, tech-focused)
Body: Open Sans (highly legible, professional)
Code/Logs: Source Code Pro (optimized for code clarity)

Core UI Components
Daily Entry Card

Split textarea with Day Log/Next Actions/Win sections
Subtle teal accent border on active section
Auto-save indicator (minimal progress bar)
Teal focus state with soft glow
Markdown preview toggle (clean slide-out panel)
Category selector dropdown above sections

Streak Grid

7×5 week view (vertical on mobile)
Color intensity based on completion (teal gradients)
Today highlighted with subtle pulse animation
Streak stats below grid (clean, numeric display)
Toggle to view per category

Context Cards

Collapsed by default
Strike-through for completed items
"Continue" buttons for unfinished tasks
Coral accent for interactive elements
Category label displayed on card

AI Insights Card

Prominent card on dashboard with dropdowns for generation type and timeframe
"Generate" button with coral accent
Conditional visibility based on entry count
Result display: Expandable section below with generated text, copy button, and subtle loading spinner
Opt-in consent checkbox/modal on first use
Category filter dropdown

Accessibility

Ensure WCAG 2.2 compliance: Minimum 4.5:1 contrast ratios for text (e.g., --text-primary on --background-primary).
Keyboard navigation support for all interactive elements.
ARIA labels for cards, heatmaps, and animations.
Alt text for any icons or generated images (future).


7. Database Schema
# Categories table
create_table :categories, id: :uuid do |t|
  t.references :user, type: :uuid
  t.string :name  # Category name (encrypted at rest)

  t.timestamps

  t.index [:user_id, :name], unique: true
end

# Entries table
create_table :entries, id: :uuid do |t|
  t.references :user, type: :uuid
  t.references :category, type: :uuid  # Link to category

  # Fields (encrypted at rest)
  t.text :day_log
  t.text :next_actions
  t.text :win

  # Metadata
  t.date :entry_date, null: false

  t.timestamps

  t.index [:user_id, :entry_date, :category_id], unique: true
end


8. Security Architecture
Encryption Flow

Server-side encryption: All sensitive data (notes, category names) encrypted at rest in the database using Lockbox or PostgreSQL encryption features.
Server storage: Encrypted data stored securely; server manages decryption for authorized access.

Security Features

Auto-lock after 15 minutes
Local drafts (unencrypted locally, encrypted on save)
Security status indicators
Audit log for exports
Memory clearing after operations
AI Insights: Opt-in only; users explicitly consent to sending selected data to Grok AI service; data not retained post-processing


9. Monetization
Free Tier

4-day rolling retention for entries
Basic entry creation and viewing only
Limited to 2 categories (defaults: Personal/Work)

Pro Tier ($5/month or $50/year)

Unlimited history
Unlimited wins tracking
Weekly email summaries (basic, non-AI)
Export wins (PDF/LinkedIn format)
Advanced search
AI Insights (unlimited generations)
Unlimited custom categories
API access (future)


1.  Success Metrics
Activation

Day 1: User creates first entry
Day 3: User has 3+ consecutive days
Day 7: User enters first win

Retention

Weekly Active: 5+ logs per week
Monthly Active: 20+ logs per month
Streak Length: Average consecutive days

Conversion

Free → Pro: 5% within 30 days
Trigger: Hit 4-day limit or need wins export/streaks/AI
Annual upgrade: 40% of monthly subscribers

Engagement

Daily entries: 80% completion rate
Wins entered: 2-3 per week average
Context used: 60% click "continue from yesterday"
AI Insights used: 50% of Pro users generate at least once per week
Categories used: Average 3+ custom categories per Pro user


11. Launch Plan (90 Days)
Month 1: Foundation (~$15K: Dev time, setup)

 Rails app setup with Hotwire
 Authentication (OAuth + email/password)
 Basic entry CRUD with encryption
 Streak visualization
 Deploy to production

Month 2: Core Features (~$20K: Feature dev, testing)

 Smart context display
 Wins system (direct entry in Win section)
 Search with blind indexing
 Data retention logic
 Export functionality
 Custom categories implementation

Month 3: Polish & Launch (~$15K: Audit, optimizations)

 Email reminders
 Keyboard shortcuts
 Mobile optimizations
 AI Insights integration (Grok API)
 Security audit
 Public launch

Post-Launch Roadmap

Git commit integration
AI-enhanced weekly summaries
Team features
Mobile apps (PWA first)
Calendar integration
Expanded AI options (e.g., custom prompts)


12. Technical Decisions
Why These Choices
Rails + Hotwire over SPA

Faster time to market
Simpler state management
Better SEO potential
Lower hosting costs
Progressive enhancement built-in

Database encryption from Day 1

Provides at-rest protection
Builds trust with secure storage
Reduces liability
Premium positioning

No categories for wins (initially)

Reduces friction
More authentic voice
Simpler UI
Better for exports

Grok AI for Insights

Leverages xAI's powerful models (Grok 4) for high-quality generations
Opt-in integration maintains privacy focus
Easy API access for text-based insights
Future-proof for advanced features

Custom Categories in MVP

Enhances flexibility for user-specific logging (e.g., 1-1 meetings)
Defaults provide immediate value while allowing customization


13. Risks & Mitigations



Risk
Mitigation



Low daily habit formation
Streak system, email reminders, quick capture mode


Encryption complexity
Use established libraries like Lockbox, clear docs


Free tier abuse
4-day limit, no API access


Competition from Notion/Obsidian
Focus on simplicity, privacy, wins portfolio


Password loss = data loss
Clear warnings, optional recovery phrase, export reminders


Privacy concerns with AI Insights
Opt-in consent, temporary data transmission only, clear user education, no retention by AI service


AI API downtime/costs
Fallback to error messages, monitor usage, budget for $0.01-0.05 per call


Category management overload
Limit free tier to 2 categories; intuitive UI for creation/deletion



14. Differentiation
Why JotChain Wins
vs. Notion/Obsidian

Purpose-built for work journaling
No feature bloat
Encrypted at rest by default
Wins-focused

vs. Generic Journals

Work context specific
Professional wins tracking
Export for reviews
Team features (future)

vs. Project Management Tools

Personal-first
No overhead
Quick capture
Individual habits


15. Core Design Principles

Speed is a feature - Every interaction under 100ms
Privacy by default - Encryption at rest isn't optional
Reduce friction - Maximum 2 clicks to log
Show progress - Visual feedback everywhere
Mobile-first - Touch-friendly, thumb-reachable
Export anything - Users own their data


16. Definition of Done for MVP

 User can sign up with email/password or OAuth
 User can create daily entries (day log, next actions, wins)
 User sees yesterday's context on login
 User can enter and filter wins
 User sees streak visualization
 User can search their entries
 User can export their data
 4-day retention works for free tier
 All data is encrypted at rest
 Mobile responsive design
 Page load under 1 second
 AI Insights card with options, timeframe, and generation (opt-in)
 Security audit passed
 Privacy policy and terms published
 Stripe integration for Pro tier
 Unit/integration tests for encryption, AI flows, and retention logic
 End-to-end QA testing on desktop/mobile


17. User Flows
Signup → First Entry
+----------+     +----------------+     +-------------+
| Start   | --> | Signup Screen | --> | Dashboard   |
+----------+     +----------------+     +-------------+
                       |                      |
                       v                      v
                 (OAuth/Email)          (Create Entry: Day Log/Next/Win)

Daily Entry → Context Recall
+-------------+     +-----------------+     +----------------+
| Dashboard  | --> | Entry Screen    | --> | Context Card  |
+-------------+     +-----------------+     +----------------+
                       |                           |
                       v                           v
                 (Auto-save)               ("Continue from previous")

Pro User → AI Insight
+-------------+     +-----------------+     +-----------------+
| Dashboard  | --> | AI Insights Card| --> | Generation Modal|
+-------------+     +-----------------+     +-----------------+
                       |                           |
                       v                           v
                 (Select type/timeframe)     (View/Copy Output)

Export Data
+-------------+     +----------------+     +----------------+
| Dashboard  | --> | Export Options | --> | Download File |
+-------------+     +----------------+     +----------------+
                       |                        |
                       v                        v
                 (Select format)          (JSON/MD)


18. Market Validation

Conduct 20-30 user interviews with target personas (developers, remote workers) pre-launch to validate free tier harshness and willingness to pay $5/month.
Run a beta test with 50 users for 2 weeks: Measure activation (first entry rate), retention (daily logs), and conversion (hits 4-day limit → upgrades).
A/B test onboarding messaging around privacy and AI to optimize signups.
Survey feedback on competitors: Focus on pain points like data security and export ease.


JotChain — Log today. Start tomorrow ahead. Your wins, encrypted & ready.
Tech Stack Summary: Rails 7.2, PostgreSQL, Hotwire, Stimulus, ViewComponents, Lockbox encryption, Tailwind CSS, Redis, Sidekiq, xAI Grok 4 API (for AI Insights)
Primary Metric: Daily Active Users with 5+ day streaks
Launch Goal: 100 paying customers in first 90 days
