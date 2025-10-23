Ah, now we're talking! This is **much clearer**. Let me rewrite the PRD for what you actually want to build:

---

## **JotChain PRD - MVP v1.0**

### **Problem**
Engineers and managers waste time before daily stand-ups, weekly syncs, and monthly reviews trying to remember "what did I even do?" Manual prep is tedious and gets skipped.

### **Solution**
Log what you do (quick entries), configure when you have meetings, receive AI-generated summaries in your inbox before those meetings.

---

## **MVP Feature Set**

### **Phase 1: JotChain (Week 1-2)**

#### 1. **Quick Entry Form**
```
What did you work on today?
┌─────────────────────────────┐
│                             │
│                             │
└─────────────────────────────┘
[Save]
```
- Single text field
- Optional: "Tag with project/area" (dropdown or free text)
- Mobile-friendly (log on commute home)

#### 2. **Email Schedule Configuration**
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

#### 3. **AI-Generated Email Summaries**
Email arrives with:
```
Subject: Your daily stand-up prep - Oct 23

Yesterday you:
• Finished API authentication refactor
• Fixed bug in payment flow
• Code reviewed 3 PRs for Sarah's team

Blockers mentioned:
• Database performance on staging

Ready for stand-up? 👍
```

#### 4. **Web Dashboard (Minimal)**
- Past entries (simple list view)
- Edit email schedule
- See upcoming summaries
- That's it.

---

### **Phase 2: Performance Reviews (Week 3-4)**

**Trigger**: After Phase 1 validates

#### 5. **GitHub Integration**
- OAuth connect GitHub account
- Select repos to track
- AI analyzes:
  - Your commits (for self-review)
  - Team's PRs/commits (for manager reviews)
  - Code review activity

#### 6. **Performance Review Generator**
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
- Deploy: Vercel

### **Backend**
- Next.js API routes
- Database: Supabase (PostgreSQL)
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
3. "When do you have meetings?" → configure schedule
4. "You'll get your first summary before tomorrow's stand-up"

### **Daily Use**
1. End of day: quick entry (2 min)
2. Next morning: email arrives
3. Walk into meeting prepared

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

### **Week 1:**
- Auth (Supabase): 2 hours
- Entry form + storage: 4 hours
- Email schedule UI: 3 hours
- Vercel cron setup: 2 hours
**Total: 11 hours**

### **Week 2:**
- AI summary generation: 4 hours
- Email template design: 3 hours
- Test + polish: 4 hours
- Deploy + domain setup: 1 hour
**Total: 12 hours**

### **Phase 1 Launch: 23 hours of work (~3 days)**

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
- **3 paying customers after trial = validated**

### **Phase 2 (Performance Reviews):**
- 50% of paid users connect GitHub
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
3. **Natural upsell**: GitHub integration for managers
4. **Low friction**: Email-first (users don't need to login daily)
5. **Quick to build**: 3 days for Phase 1
6. **Easy to validate**: Email open rates tell you everything

---

## **Open Questions to Answer**

1. **Do you want users to log entries on weekends?** (probably no, skip weekends)
2. **Should GitHub integration be automatic or user-selected repos?** (user-selected, more privacy)
3. **How far back should performance reviews go?** (6 months default, configurable)
4. **Should emails include GitHub activity or just manual entries in Phase 1?** (just manual, simpler)

---

**Does this match your vision?** The key insight is: **Phase 1 = meeting prep (validated in 2 weeks), Phase 2 = performance reviews with GitHub (build only if Phase 1 works).**

This way you're not spending weeks on GitHub integration before knowing if anyone wants the core product.
