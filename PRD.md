## **JotChain PRD - MVP v1.0**

### **Problem**
Engineers and managers waste time before daily stand-ups, weekly syncs, and monthly reviews trying to remember "what did I even do?" Manual prep is tedious and gets skipped.

### **Solution**
Log what you do (quick entries), configure when you have meetings, receive AI-generated summaries in your inbox before those meetings.

---

## **MVP Feature Set**

### **Phase 1: JotChain (Week 1-2)**

#### 1. **Quick Entry Form with Smart Writing Coach**
```
What did you work on today?
┌─────────────────────────────────────────┐
│ Fixed auth timeout in @backend          │  <- @-mentions autocomplete
│ affecting 200+ enterprise users         │
└─────────────────────────────────────────┘

[Quality Score: 8/10] ✨ Great! You included impact & specifics.

[@backend]  [Save]
```

**@-Mentions for Projects:**
- Type `@` to trigger project autocomplete dropdown
- Shows existing projects + "Create new project: @{text}"
- Multiple projects can be mentioned per entry
- Displayed as colored chips below entry

**Smart Writing Coach (Real-time):**
- Pattern-based detection of vague phrases:
  - "fixed bug" → "Which bug? Include ticket number"
  - "worked on" → "What specifically did you accomplish?"
  - "had meeting" → "What was decided? Any action items?"
- Quality score (0-10) based on:
  - Specific metrics/numbers
  - Actionable language (shipped, launched, fixed)
  - Context and impact
  - Entry length
- Color-coded: 🔴 <4, 🟡 4-7, 🟢 >7
- **Never blocks submission** - suggestions only

**Features:**
- Single text field (keeps it quick)
- Mobile-friendly (log on commute home)
- Progressive enhancement - works without JS

#### 2. **Projects (Optional Organization)**
```
Your Projects

🔵 Backend        (12 entries)    [Edit]
🟢 Mobile App     (8 entries)     [Edit]
🟡 DevOps         (5 entries)     [Edit]

[+ Create New Project]
```

**Purpose:**
- Organize entries by work area/product/team
- Prepare for Phase 2: map GitHub repos to projects
- Optional - entries can exist without projects

**Data Model:**
```
Project {
  id: uuid
  name: string (required)
  description: string (optional)
  color: hex color
  user_id: uuid
}

entry_projects (junction table)
  entry_id ↔ project_id (many-to-many)
```

**Features:**
- Create projects on-the-fly via @-mentions or dashboard
- Color coding for visual organization
- Used in AI summaries to group entries
- Dashboard shows entry count per project

#### 3. **Email Schedule Configuration**
```
When do you have meetings?

☑ Daily stand-up
  Every weekday at 9:00 AM

☑ Weekly sync
  Every Friday at 2:00 PM

☑ Monthly review
  First Monday of month at 10:00 AM

[Save Schedule]
```
- Checkboxes for common patterns
- Time picker (user's timezone)
- Email sent 30 mins before meeting

#### 4. **AI-Generated Email Summaries (Project-Grouped)**
Email arrives with:
```
Subject: Your daily stand-up prep - Oct 24

📦 Backend (2 entries)
• Finished API authentication refactor
• Fixed auth timeout bug affecting 200+ enterprise users

💳 Payments (1 entry)
• Resolved payment flow issue causing checkout failures

💡 Team Collaboration
• Code reviewed 3 PRs for Sarah's team

Blockers mentioned:
• Database performance on staging

💬 Quality tip: Your entries averaged 7.5/10 this week - keep including
   specific metrics and impact!

Ready for stand-up? 👍
```

**Enhancements:**
- Entries grouped by project (color-coded emoji)
- Uncategorized entries shown separately
- Quality score trend included
- Still focuses on: accomplishments, blockers, context

#### 5. **Web Dashboard (Minimal)**
```
Tabs: [Entries] [Projects] [Settings]

Entries View:
┌────────────────────────────────────────┐
│ Oct 24 · [@backend] [@payments]        │
│ Fixed auth timeout affecting 200+...   │
│ Quality: 🟢 8/10                       │
└────────────────────────────────────────┘

Projects View:
🔵 Backend (12 entries)
🟢 Mobile (8 entries)
```

**Features:**
- Past entries with project tags
- Filter by project
- Quality scores visible
- Edit email schedule
- See upcoming summaries
- Project management
- That's it - keep it minimal

---

### **Phase 2: Performance Reviews (Week 3-4)**

**Trigger**: After Phase 1 validates

#### 6. **GitHub Integration**
- OAuth connect GitHub account
- Select repos to track
- **Map repos to projects** (e.g., `backend-api` → @backend project)
- AI analyzes:
  - Your commits (for self-review)
  - Team's PRs/commits (for manager reviews)
  - Code review activity
- Automatically creates entries from significant commits

#### 7. **Performance Review Generator**
```
Generate review for:
☑ Yourself (last 6 months)
☐ Direct report: [Select team member]

Include:
☑ Manual entries from JotChain
☑ GitHub activity
☑ Code review contributions

[Generate Review Draft]
```

Output:
- Technical contributions (from GitHub)
- Project impact (from your entries)
- Team collaboration (from code reviews)
- Growth areas

---

## **Tech Stack (Optimized)**

### **Frontend**
- Next.js (React + API routes)
- Tailwind CSS
- **@-mentions autocomplete:** Headless UI Combobox or Radix UI
- **Quality scoring:** Client-side JS (pattern matching)
- Deploy: Vercel

### **Backend**
- Next.js API routes
- Database: Supabase (PostgreSQL)
  - Tables: users, entries, projects, entry_projects
  - Junction table for many-to-many relationships
- Auth: Supabase Auth

### **Scheduling/Email**
- Vercel Cron Jobs (free for scheduled emails)
- Resend or SendGrid for email delivery
- Store user schedule in DB, cron checks every hour

### **AI**
- OpenAI API (GPT-4o mini for cost efficiency)
- Prompts tuned for meeting summaries

### **GitHub (Phase 2)**
- GitHub OAuth
- Octokit.js for API calls
- Store: repo list, last sync time

---

## **User Flow (MVP)**

### **First Time User**
1. Sign up with email
2. "Add your first entry" prompt
3. **Optional:** "Create a project to organize your work" (can skip)
4. See real-time quality coach suggestions as they type
5. "When do you have meetings?" → configure schedule
6. "You'll get your first summary before tomorrow's stand-up"

### **Daily Use**
1. End of day: quick entry (2 min)
   - Type naturally, use @-mentions for projects
   - See quality score and suggestions
   - Submit when ready (no blocking)
2. Next morning: email arrives (project-grouped)
3. Walk into meeting prepared with context

### **Weekly/Monthly**
1. Same flow, but longer-form summaries
2. "This week you shipped X, Y, Z"
3. "This month: 12 PRs merged, 3 features launched"

---

## **What This Solves**

### **For Individual Contributors:**
- Never blank in stand-ups
- Track your own impact over time
- Performance review prep becomes easy

### **For Engineering Managers (Phase 2):**
- See what team accomplished (GitHub data)
- Write team reviews faster
- Spot patterns (who's stuck? who's crushing it?)

---

## **Critical Questions**

### **Q: How often do users log entries?**
**A:** Flexible, but nudge for daily. Send reminder email at 5pm: "Log your day (takes 1 min)"

### **Q: What if someone forgets to log for a week?**
**A:** Phase 2 GitHub integration fills gaps. "No entries this week, but here's your GitHub activity..."

### **Q: How do we prevent AI hallucinations?**
**A:**
- Show user's actual entries in email (not just summary)
- "Based on your entries: [bullets]. Summary: [AI text]"
- Edit button to fix mistakes

### **Q: Pricing?**
**A:**
- Free: 14 days trial, 50 entries
- Pro ($12/mo): Unlimited entries, all meeting types, email delivery
- Team ($49/mo for 5 people): GitHub integration, team reviews

---

## **Build Timeline**

### **Week 1 (Enhanced):**
- Auth (Supabase): 2 hours
- **Projects CRUD + data model:** 3 hours *(new)*
- Entry form + storage: 4 hours
- **@-Mentions autocomplete UI:** 4 hours *(new)*
- Email schedule UI: 3 hours
- Vercel cron setup: 2 hours
**Total: 18 hours** (was 11 hours)

### **Week 2:**
- **Smart Writing Coach (patterns + scoring):** 5 hours *(new)*
- AI summary generation (with project grouping): 5 hours (was 4)
- Email template design (project sections): 4 hours (was 3)
- Test + polish: 4 hours
- Deploy + domain setup: 1 hour
**Total: 19 hours** (was 12 hours)

### **Phase 1 Launch: 37 hours of work (~5 days)** (was 23 hours / 3 days)

**Worth the extra 2 days for:**
- Projects foundation for Phase 2
- Modern @-mentions UX
- Smart Writing Coach differentiation

### **Week 3-4 (if validated):**
- GitHub OAuth: 4 hours
- Repo selection UI: 3 hours
- Fetch + parse GitHub data: 6 hours
- Performance review generator: 5 hours
- Testing: 4 hours
**Total: 22 hours (~3 days)**

---

## **Success Metrics**

### **Phase 1 (JotChain):**
- 20 signups in week 1
- 10+ people configure email schedule
- 5+ people log entries for 5 consecutive days
- **NEW:** 3+ users create at least 2 projects
- **NEW:** Average entry quality score > 6.0 by end of week 2
- **NEW:** 70%+ of entries use @-mentions after day 3
- Email open rate > 60% (validates meeting prep value)
- **3 paying customers after trial = validated**

**Quality Tracking:**
- Monitor score distribution (how many <4, 4-7, >7)
- Track improvement over time (are users learning?)
- Correlate quality scores with retention

### **Phase 2 (Performance Reviews):**
- 50% of paid users connect GitHub
- 80%+ of GitHub repos mapped to existing projects
- 10+ reviews generated
- Retention improves (less churn)

---

## **What's NOT in MVP**

❌ Slack integration (maybe Phase 3)
❌ Calendar integration (manual schedule for now)
❌ Mobile app (PWA is fine)
❌ Team collaboration features
❌ Analytics dashboard
❌ Rich text editor
❌ Document export (just email for now)
❌ Multiple workspaces/projects
❌ Jira/Linear integration

---

## **Why This Works**

1. **Clear primary use case**: JotChain (everyone has meetings)
2. **Immediate value**: First email = "aha moment"
3. **Quality coaching angle**: Teaches better self-reflection, improves over time
4. **Projects prepare for scale**: Foundation for GitHub integration (Phase 2)
5. **Modern UX**: @-mentions feel polished, creates memorable demo moments
6. **Natural upsell**: GitHub integration for managers
7. **Low friction**: Email-first (users don't need to login daily), projects optional
8. **Quick to build**: 5 days for Phase 1 (worth the extra 2 days for differentiation)
9. **Easy to validate**: Email open rates + quality score trends tell you everything

**The Differentiator:** Smart Writing Coach ensures quality input → better AI summaries → stronger meeting prep value prop. Competitors focus on logging; we focus on **learning**.

---

## **Why These 3 Features Make MVP "Catch Eyes"**

### **1. Projects - Foundation & Future-Proofing**
**Problem Solved:** Users need organization. Competitors have this.
**Strategic Value:**
- Table stakes feature (would look incomplete without it)
- Prepares architecture for Phase 2 GitHub integration
- Enables better AI summaries (grouped by project)
- Low effort, high perceived value

**Demo Moment:** "All your backend work in one view, ready for your team sync"

### **2. @-Mentions - Modern UX Signal**
**Problem Solved:** Tagging projects should be fast, not a separate dropdown step.
**Strategic Value:**
- Shows design polish and attention to DX/UX
- Familiar pattern (Notion, Linear, Slack all use it)
- Feels more "professional tool" than basic form
- Creates muscle memory (users remember the experience)

**Demo Moment:** "Just type @ and watch it autocomplete - like Notion, but for your work log"

### **3. Smart Writing Coach - THE Differentiator**
**Problem Solved:** Vague entries = vague AI summaries = wasted time.
**Strategic Value:**
- **Unique positioning:** Teach users to reflect better (not just log)
- Ensures quality input → guarantees useful output
- Viral potential: "My self-awareness improved after 2 weeks of JotChain"
- Creates habit loop: better entries → better summaries → more engagement
- Can measure improvement (gamification potential)

**Demo Moment:** "See that 8/10? You just wrote a high-quality reflection in 30 seconds. Tomorrow's stand-up is going to be effortless."

---

**Combined Impact:**
- Projects = credibility (looks complete)
- @-Mentions = polish (feels premium)
- Smart Coach = differentiation (actually unique)

Without these, JotChain is "just another logging tool with AI."
With these, JotChain is "the tool that makes you better at reflecting on your work."

---

## **Open Questions to Answer**

### **Original Questions:**
1. **Do you want users to log entries on weekends?** (probably no, skip weekends)
2. **Should GitHub integration be automatic or user-selected repos?** (user-selected, more privacy)
3. **How far back should performance reviews go?** (6 months default, configurable)
4. **Should emails include GitHub activity or just manual entries in Phase 1?** (just manual, simpler)

### **New Questions (For 3 Features):**
5. **Should we suggest default projects on signup?** (e.g., "Work", "Personal", "Team")
   - Pro: Lower barrier to entry
   - Con: Might clutter; optional is cleaner
6. **What quality score threshold triggers educational tips?** (<5? <6?)
   - Pro: Help struggling users improve
   - Con: Don't want to be annoying
7. **Should @-mentions work in the middle of words or only after whitespace?**
   - Example: "worked@backend" vs "worked @backend"
   - Recommend: whitespace only (cleaner parsing)
8. **Show quality score history in dashboard?**
   - Pro: Gamification, shows improvement
   - Con: Extra scope
   - Recommend: Phase 1.5

---

## **Summary: Updated MVP Vision**

**Core Value Prop (Unchanged):**
Log what you do → Receive AI summaries before meetings → Better meeting prep

**Enhanced With:**
1. **Projects:** Optional organization, prepares for GitHub integration
2. **@-Mentions:** Modern UX for fast project tagging
3. **Smart Writing Coach:** Real-time quality feedback (the differentiator)

**Key Insight:**
- **Phase 1** (5 days): JotChain with quality coaching → validated via email opens & quality scores
- **Phase 2** (3 days): GitHub integration + performance reviews → build only if Phase 1 works

**Strategic Trade-off:**
- Added 2 days to build time (3 days → 5 days)
- Gained: Differentiation, better summaries, Phase 2 foundation
- Worth it: "Catch eyes" features that make MVP feel complete and unique

This isn't feature creep - it's **strategic positioning**. We're not just building a logging tool; we're building a **reflection & growth tool** that happens to solve meeting prep.
