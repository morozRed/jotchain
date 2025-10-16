# JotChain Product Requirements Document (PRD)

## 1. Document Overview
### 1.1 Purpose
This Product Requirements Document (PRD) outlines the vision, requirements, and specifications for JotChain, a web-based SaaS application designed to empower modern product, engineering, revenue, and operations leaders. JotChain serves as an AI-powered career companion, enabling users to log professional notes (e.g., accomplishments, 1-1 meeting notes, customer updates) and generate automated summaries for performance reviews, daily stand-ups, interview prep, and monthly recaps. The app will be built using Ruby on Rails as the primary framework, with integrations for AI summarization and email delivery.

This PRD serves as a blueprint for development, guiding the MVP build and future iterations. It draws from user needs identified in brainstorming sessions, focusing on simplicity, security, and cross-functional intelligence suited for high-performing teams.

### 1.2 Scope
- **In Scope**: Core note management, AI summarization, automated emails, user authentication, basic analytics, and subscription monetization with a 14-day free trial.
- **Out of Scope**: Advanced team collaborations (e.g., shared chains), deep integrations (e.g., GitHub auto-pull), blockchain features, or mobile-native apps (start with web/PWA).
- **Version**: MVP 1.0
- **Target Launch Date**: Q1 2026 (assuming development starts November 2025)
- **Tech Stack**:
  - Backend: Ruby on Rails (for MVC structure, API endpoints, and job scheduling).
  - Frontend: React.js (integrated via Rails API or Hotwire for simplicity).
  - Database: PostgreSQL (for relational data like users/notes).
  - AI: OpenAI API (or similar LLM for summarization).
  - Email: SendGrid or ActionMailer for scheduled deliveries.
  - Hosting: Heroku or Render for quick deployment.
  - Authentication: Devise gem for Rails.
  - Background Jobs: Sidekiq for email scheduling and AI tasks.
  - Security: Encryption with Rails' ActiveSupport::MessageEncryptor.

### 1.3 Stakeholders
- **Product Owner**: [User/Founder]
- **Developers**: Ruby on Rails team
- **Users**: Product leads, engineering managers, revenue leaders, senior ICs
- **External**: AI providers (e.g., OpenAI), email services

### 1.4 Revision History
- Version 1.0: Initial draft (October 15, 2025)

## 2. Problem Statement
Cross-functional leaders — from engineering managers to product leads and revenue owners — juggle high-stakes responsibilities, including tracking personal and team accomplishments, documenting 1-1 meetings, capturing customer signals, and preparing reports for performance reviews or daily syncs. Existing tools like Notion templates or general AI chats (e.g., Grok) are either too manual/generic or lack persistence and automation. This leads to:
- Time wasted on manual aggregation and recall.
- Missed opportunities to showcase impact during reviews or promotions.
- Burnout from unstructured note-taking.
- Security risks with sensitive feedback scattered across tools.

JotChain solves this by providing a purpose-built, AI-driven platform that chains notes into actionable insights, delivered proactively via emails.

## 3. Goals and Objectives
### 3.1 Business Goals
- Acquire 1,000 active users in the first 6 months post-launch.
- Achieve 35% conversion from 14-day trial to paid subscription.
- Position as the "AI Career OS for modern cross-functional leaders" in tech communities.
- Generate $10K MRR within Year 1 via subscriptions.

### 3.2 Product Objectives
- Reduce time spent on review, interview, and resume prep by 80% through AI summaries.
- Increase user engagement with automated inbox/Slack digests and scheduled nudges.
- Ensure 99% uptime and data security for trust-building.
- Differentiate from competitors (Notion: too manual; Grok: no persistence) via cross-functional AI context and automation.

### 3.3 Success Metrics
- **Acquisition**: Sign-ups, waitlist conversions.
- **Engagement**: Daily active users (DAU), notes logged per user, summaries generated.
- **Retention**: Churn rate (<10% monthly), email open rates (>50%).
- **Monetization**: Trial-to-paid conversion rate, average revenue per user (~$9/mo).
- **Feedback**: NPS score (>8/10), user surveys.

## 4. Target Audience and User Personas
### 4.1 Target Audience
- Primary: Product leads, engineering managers, revenue/sales leaders, and senior ICs in high-growth companies (software, SaaS, and GTM-heavy orgs).
- Secondary: Operations, customer success, and HR business partners who coach teams on performance.
- Demographics: 25-45 years old, tech-savvy, managing cross-functional collaboration.
- Pain Points: Overwhelmed by context-switching; need quick, secure ways to log and recall impact across product, customer, and revenue workstreams.

### 4.2 User Personas
- **Persona 1: Alex the Engineering Manager**
  - Age: 35
  - Role: Manages a team of 8 devs at a mid-stage startup.
  - Needs: Track 1-1 feedback, log wins for promo packets, get daily stand-up reminders.
  - Goals: Ace quarterly reviews without manual digging.
- **Persona 2: Jordan the Tech Lead**
  - Age: 28
  - Role: Leads projects as a senior dev.
  - Needs: Jot quick accomplishments, summarize weekly progress for stakeholders.
  - Goals: Build a "chain" of evidence for career growth.
- **Persona 3: Maya the Product Lead**
  - Age: 32
  - Role: Owns roadmap delivery and cross-functional launches.
  - Needs: Consolidate customer feedback, GTM updates, and launch metrics into one narrative for exec syncs and resume refreshes.
  - Goals: Communicate impact clearly across leadership, product, and revenue stakeholders.

## 5. Features and Requirements
Features are prioritized for MVP. Use Rails' RESTful APIs for CRUD operations.

### 5.1 Functional Requirements
#### User Authentication and Profiles
- Users can sign up/login via email/password or OAuth (Google/GitHub).
- Profile includes: Name, role, company, time zone, email preferences.
- Requirements: Secure sessions (Devise), password hashing.

#### Note Management
- Create notes with: Title, body (rich text via ActionText), category (e.g., Accomplishment, 1-1 Note), tags, date.
- View/edit/delete notes in a searchable timeline view.
- Auto-suggest categories via AI (quick OpenAI call).
- Requirements: PostgreSQL storage, full-text search (pg_search gem).

#### AI-Powered Summarization
- Generate on-demand summaries: Daily/weekly recaps, performance reviews, resume or interview prep packets, custom queries.
- AI insights: Pattern detection (e.g., "Leadership signals from code reviews", "Customer wins influencing NRR").
- Requirements: Integrate OpenAI API; background jobs for processing; prompts tuned for cross-functional language.

#### Automated Emails
- Daily email: Morning summary of prior day's notes, formatted for stand-ups or pipeline reviews.
- Weekly/Monthly digests: Overview of period's achievements and risks, with Slack delivery option.
- Custom scheduling & nudges: User sets cadence/time via UI; optional reminders to jot wins.
- Requirements: Sidekiq for cron-like jobs; email/Slack templates with MJML/Block Kit; opt-in/out.

#### Data Export and Analytics
- Export summaries as PDF/Markdown, including resume-ready formats.
- Basic dashboard: Notes logged, summaries generated.
- Requirements: Wicked PDF gem for exports; Chartkick for visuals.

### 5.2 Non-Functional Requirements
- **Performance**: Page loads <2s; AI summaries <10s.
- **Security**: End-to-end encryption for notes (Rails encryptor); HTTPS; GDPR compliance.
- **Scalability**: Handle 1K users initially; use Redis for caching.
- **Usability**: Responsive design (Bootstrap/Tailwind); accessible (WCAG 2.1).
- **Reliability**: 99% uptime; error logging (Sentry).

### 5.3 Integrations
- AI: OpenAI (or Grok API if available).
- Email: SendGrid.
- Future: GitHub/Jira for auto-imports (post-MVP).

## 6. User Stories and Use Cases
### 6.1 Key User Stories
- As a lead dev, I want to quickly jot a note after a 1-1 so I can capture feedback without friction.
- As a product lead, I want an AI-generated launch recap so I can brief execs and refresh my resume in minutes.
- As a revenue manager, I want automated inbox/Slack digests so I can walk into pipeline and stand-up meetings prepared.
- As a trial user, I want 14 days of full access so I can evaluate summaries, exports, and automations before purchasing.

### 6.2 Use Case: Daily Workflow
1. User logs in, jots a note via form.
2. Overnight, AI processes and schedules email.
3. Morning: User receives email with bullets for stand-up.
4. User generates on-demand review summary, exports PDF/Markdown for review or resume update.

## 7. Assumptions, Risks, and Dependencies
- **Assumptions**: Users have stable internet; AI APIs remain affordable (~$0.01 per summary).
- **Risks**: AI hallucinations—mitigate with prompt engineering and user editing.
- **Dependencies**: OpenAI API key; domain (jotchain.com) setup.

## 8. Monetization
- **Model**: Subscription with a 14-day free trial leading into a single paid tier.
  - JotChain Pro ($9/mo): Unlimited notes and AI summaries, inbox/Slack digests, resume-ready exports.
- **Implementation**: Stripe integration via Rails with trial management, automated conversion to paid, and self-serve cancellation.

## 9. Roadmap
- **MVP (4-6 weeks)**: Auth, notes, AI summaries, emails.
- **Phase 2 (Months 2-3)**: Integrations, analytics.
- **Phase 3**: Team sharing, blockchain option.

## 10. Appendix
- **Wireframes**: [Placeholder—use Figma for basic sketches: Login page, Note timeline, Summary dashboard.]
- **Data Model**:
  | Entity | Attributes |
  |--------|------------|
  | User | id, email, role, time_zone |
  | Note | id, user_id, title, body, category, tags, created_at |
  | Summary | id, user_id, type (e.g., weekly), content, generated_at |
- **API Endpoints** (Rails examples):
  - POST /notes: Create note.
  - GET /summaries/weekly: Generate recap.
