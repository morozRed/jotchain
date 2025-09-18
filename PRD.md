# Product Requirements Document (PRD)

## Product: **JotChain**
A lightweight, privacy-first web app for daily work journaling, context handover, and professional growth tracking.

---

## 1. Objective
Build a secure, simple tool where users can **log what they did and what they'll do next**, while enabling them to:
- Maintain continuity between work sessions with intelligent context recall
- Track and showcase professional wins for career growth
- Build consistent habits through visual streaks
- Keep all data end-to-end encrypted for complete privacy
- Export wins for performance reviews and job applications

---

## 2. Target Users
- **Individual developers & professionals** who need daily context switching
- **Privacy-conscious knowledge workers** who want secure journaling
- **Career-focused individuals** building a portfolio of achievements
- **Remote workers** who need to track daily accomplishments
- **Small teams** who need lightweight async handoffs (future)

---

## 3. Core Value Propositions
1. **"Start tomorrow where you left off"** - Intelligent context recall
2. **"Your wins, ready for reviews"** - One-click formatted exports
3. **"Truly private"** - End-to-end encryption, zero-knowledge architecture
4. **"Build momentum"** - Visual streaks and habit tracking
5. **"Works instantly"** - No app download, fast web experience

---

## 4. Technical Stack

### Backend
- **Rails 7.2+** with PostgreSQL
- **Hotwire** (Turbo + Stimulus) for real-time updates
- **Redis** for ActionCable and caching
- **Sidekiq** for background jobs

### Frontend
- **ViewComponents** for reusable UI
- **ActionText** with custom Stimulus controllers
- **Tailwind CSS** with custom design tokens
- **Web Crypto API** for client-side encryption

### Key Gems
```ruby
gem 'rails', '~> 7.2'
gem 'devise'  # Authentication
gem 'lockbox'  # Encryption helpers
gem 'blind_index'  # Encrypted search
gem 'view_component'  # Component architecture
```

__

## 5. MVP Features (Launch Ready)

### 5.1 Authentication
- **Magic link email** (passwordless primary)
- OAuth secondary (Google/GitHub)
- Secure session management with auto-lock

### 5.2 Entry System
- **Quick Capture Mode**: Single field with natural language
- **Structured Mode**: Split "Done Today" / "Next Up" sections
- **Markdown support** with live preview
- **Auto-save** every 10 seconds to encrypted local storage
- **Win marking** with three levels (Minor/Major/Career-Defining)

### 5.3 Context Display
- **Previous Entry** card shown on homepage (your last entry, whenever it was)
- **Recent entries** list (last 6 entries)
- **"Continue from previous"** quick action to carry over unfinished items
- Collapsible cards to reduce clutter

### 5.4 Streak Visualization
- **Vertical calendar heatmap** (mobile-optimized)
- Current streak with flame animation (🔥)
- Best streak achievement display
- Activity intensity based on completeness

### 5.5 Wins System (Simplified)
- **No categories** - users describe impact in their own words
- **Three importance levels**: Minor, Major, Career-Defining
- **One-click copy** as formatted text for reviews/LinkedIn
- **Wins dashboard** with level filtering
- Export wins as markdown

### 5.6 Navigation
- **Calendar date picker** to jump to any date
- **Previous/Next day** arrows
- **Keyboard shortcuts** (Cmd+N new, Cmd+Enter save)
- **Today button** to return to current date

### 5.7 Data & Security
- **End-to-end encryption** using Web Crypto API
- **Zero-knowledge architecture** - we can't read user data
- **Recovery phrase** during signup
- **6-day retention** for free tier with clear countdown
- **Export all data** as encrypted JSON or markdown

---

## 6. UI Design System

### Color Palette
```css
/* Deep space navy background with electric amber accent */
--background-primary: #0A0E1B
--background-secondary: #111827
--background-tertiary: #1A1F36

/* Electric Amber - Primary Accent */
--accent-primary: #FFA116
--accent-hover: #FFB84D
--accent-muted: #FFA11620
--accent-glow: 0 0 20px #FFA11640

/* Text Colors */
--text-primary: #F7F8FA
--text-secondary: #94A3B8
--text-tertiary: #64748B

/* Semantic Colors */
--success: #10B981 (streaks)
--wins-minor: #60A5FA
--wins-major: #FFA116
--wins-career: #F97316
```

### Typography
- **Headers**: JetBrains Mono
- **Body**: Inter
- **Code/Logs**: JetBrains Mono

### Core UI Components

#### Daily Entry Card
- Split textarea with Done/Next sections
- Floating win toggle (star icon)
- Auto-save indicator
- Amber glow on focus
- Markdown preview toggle

#### Streak Grid
- 7×5 week view (vertical on mobile)
- Color intensity based on completion
- Today highlighted with pulse
- Streak stats below grid

#### Context Cards
- Collapsed by default
- Strike-through for completed items
- "Continue" buttons for unfinished tasks
- Subtle left border accent

---

## 7. Database Schema

```ruby
# Encrypted entries table
create_table :entries, id: :uuid do |t|
  t.references :user, type: :uuid

  # Encrypted fields
  t.text :content_ciphertext
  t.text :next_actions_ciphertext

  # Blind indexes for search
  t.string :content_bidx

  # Unencrypted metadata
  t.date :entry_date, null: false
  t.boolean :is_win, default: false
  t.string :win_level  # minor|major|career

  t.timestamps

  t.index [:user_id, :entry_date], unique: true
end
```

---

## 8. Security Architecture

### Encryption Flow
1. **Key Derivation**: PBKDF2 from user password (100k iterations)
2. **Client-side encryption**: All content encrypted in browser
3. **Server storage**: Only encrypted blobs stored
4. **Search**: Blind indexing for encrypted search
5. **Recovery**: 12-word phrase for account recovery

### Security Features
- Auto-lock after 15 minutes
- Encrypted local drafts
- Security status indicators
- Audit log for exports
- Memory clearing after operations

---

## 9. Monetization

### Free Tier
- 6-day rolling retention
- Basic streak view
- 3 wins per month
- In-app weekly summary

### Pro Tier ($6/month or $60/year)
- **Unlimited history**
- **Unlimited wins tracking**
- **Weekly email summaries**
- **Export wins** (PDF/LinkedIn format)
- **Advanced search**
- **API access** (future)

### Team Tier ($5/user/month) - Future
- Shared team dashboards
- Manager summaries
- Team streaks
- SSO/SAML

---

## 10. Success Metrics

### Activation
- **Day 1**: User creates first entry
- **Day 3**: User has 3+ consecutive days
- **Day 7**: User marks first win

### Retention
- **Weekly Active**: 5+ logs per week
- **Monthly Active**: 20+ logs per month
- **Streak Length**: Average consecutive days

### Conversion
- **Free → Pro**: 5% within 30 days
- **Trigger**: Hit 6-day limit or need wins export
- **Annual upgrade**: 40% of monthly subscribers

### Engagement
- **Daily entries**: 80% completion rate
- **Wins marked**: 2-3 per week average
- **Context used**: 60% click "continue from yesterday"

---

## 11. Launch Plan (90 Days)

### Month 1: Foundation
- [ ] Rails app setup with Hotwire
- [ ] Authentication (magic link + OAuth)
- [ ] Basic entry CRUD with encryption
- [ ] Streak visualization
- [ ] Deploy to production

### Month 2: Core Features
- [ ] Smart context display
- [ ] Wins system (no categories)
- [ ] Search with blind indexing
- [ ] Data retention logic
- [ ] Export functionality

### Month 3: Polish & Launch
- [ ] Email reminders
- [ ] Keyboard shortcuts
- [ ] Mobile optimizations
- [ ] Security audit
- [ ] Public launch

### Post-Launch Roadmap
- Git commit integration
- AI-powered weekly summaries
- Team features
- Mobile apps (PWA first)
- Calendar integration

---

## 12. Technical Decisions

### Why These Choices

**Rails + Hotwire over SPA**
- Faster time to market
- Simpler state management
- Better SEO potential
- Lower hosting costs
- Progressive enhancement built-in

**End-to-end encryption from Day 1**
- Major differentiator
- Builds trust immediately
- Reduces liability
- Premium positioning

**No categories for wins**
- Reduces friction
- More authentic voice
- Simpler UI
- Better for exports

**Vertical streak grid**
- Mobile-first design
- Unique visual identity
- Better for thumbs
- More compact

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Low daily habit formation | Streak system, email reminders, quick capture mode |
| Encryption complexity | Recovery phrases, clear UX, help docs |
| Free tier abuse | 6-day limit, no API access |
| Competition from Notion/Obsidian | Focus on simplicity, privacy, wins portfolio |
| Password loss = data loss | Clear warnings, recovery phrase, export reminders |

---

## 14. Differentiation

### Why JotChain Wins

**vs. Notion/Obsidian**
- Purpose-built for work journaling
- No feature bloat
- Encrypted by default
- Wins-focused

**vs. Generic Journals**
- Work context specific
- Professional wins tracking
- Export for reviews
- Team features (future)

**vs. Project Management Tools**
- Personal-first
- No overhead
- Quick capture
- Individual habits

---

## 15. Core Design Principles

1. **Speed is a feature** - Every interaction under 100ms
2. **Privacy by default** - Encryption isn't optional
3. **Reduce friction** - Maximum 2 clicks to log
4. **Show progress** - Visual feedback everywhere
5. **Mobile-first** - Touch-friendly, thumb-reachable
6. **Export anything** - Users own their data

---

## 16. Definition of Done for MVP

- [ ] User can sign up with email magic link
- [ ] User can create encrypted daily entries
- [ ] User sees yesterday's context on login
- [ ] User can mark and filter wins
- [ ] User sees streak visualization
- [ ] User can search their entries
- [ ] User can export their data
- [ ] 6-day retention works for free tier
- [ ] All data is end-to-end encrypted
- [ ] Mobile responsive design
- [ ] Page load under 1 second
- [ ] Security audit passed
- [ ] Privacy policy and terms published
- [ ] Stripe integration for Pro tier

---

**JotChain** — *Log today. Start tomorrow ahead. Your wins, encrypted & ready.*

**Tech Stack Summary**: Rails 7.2, PostgreSQL, Hotwire, Stimulus, ViewComponents, Lockbox encryption, Tailwind CSS, Redis, Sidekiq

**Primary Metric**: Daily Active Users with 5+ day streaks

**Launch Goal**: 100 paying customers in first 90 days
