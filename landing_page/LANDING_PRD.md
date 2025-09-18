# Product Requirements Document (PRD)

## Product: **JotChain Landing Page**

A modern, minimal SaaS landing page to validate interest, collect signups, and communicate JotChain’s unique value.

---

## 1. Objective

The landing page should:

* Clearly explain what JotChain is and why it matters.
* Capture early adopters via email waitlist or account sign-up.
* Highlight unique wins for daily work, career growth, and personal brand.
* Nudge toward Pro conversion (or at least awareness of pricing tiers).

---

## 2. Target Audience

* Developers, knowledge workers, and productivity-minded users.
* Professionals who prep daily standups, weekly updates, or resumes.
* Creators and builders who want ideas for tweets/blogs.
* Early adopters curious about new productivity tools.

---

## 3. Core Use Cases

1. **First-Time Visitor:** Quickly understands JotChain’s purpose and how it’s different.
2. **Curious Sign-Up:** Provides email to join waitlist or creates a free account.
3. **Pro-Aware User:** Learns about Pro features and pricing, priming them for upgrade.

---

## 4. Features & Requirements

### MVP Sections

1. **Header / Navigation**

   * Logo left, links right (*Features, Pricing, Login, CTA “Join Free”*).
   * Sticky on scroll.

2. **Hero Section (Top Fold)**

   * **Headline:** *“Log today. Start tomorrow ahead.”*
   * **Subheadline:** *“JotChain helps you recall yesterday’s work, keep your streak alive, and showcase your wins.”*
   * **Primary CTA:** *“Join the Waitlist”*.
   * **Visual:** Product mockup (log input + vertical streak grid).

3. **How It Works (3 Steps)**

   * **Step 1 – Jot:** Write down what you did and what’s next.
   * **Step 2 – Recall:** See yesterday’s log when you come back.
   * **Step 3 – Grow:** Track streaks and wins over time.

4. **Key Features**

   * Daily log (Done / Next).
   * Streak grid (vertical chain).
   * Wins tracking.
   * Weekly summaries.
   * Yesterday’s context recall.

5. **Wins Section (Why JotChain?)**
   Four main wins, each presented in a card with icon:

   1. **Shine in Daily Calls** — Stand out with clear, detailed updates prepared in seconds.
   2. **Turn Progress into Career Wins** — Mark achievements and export them into resume-ready highlights.
   3. **Capture Everything, Your Way** — Custom categories for 1:1s, projects, or personal notes.
   4. **Never Run Out of Content** — Get recommendations for tweets and blog posts from your logs, fueling your personal brand.

6. **Social Proof / Early Access**

   * Testimonial placeholders or “Be among the first 100 beta testers.”

7. **Pricing Preview**

   * **Free:** 6-day history, streak grid.
   * **Pro (\$6/mo or \$60/yr):** Unlimited logs, wins dashboard, summaries, exports.
   * CTA: *“Join Free, Upgrade Anytime.”*

8. **Secondary CTA Banner**

   * Reinforce signup with tagline + form:
     *“Don’t lose your progress — join JotChain today.”*

9. **Footer**

   * Links: About · Contact · Privacy · Terms.
   * Social icons (Twitter/X, LinkedIn, GitHub).
   * Copyright + small logo.

---

## 5. Non-Functional Requirements

* **Performance:** Fast load (<2s).
* **Responsive:** Mobile-first design.
* **Accessibility:** AA contrast, keyboard-friendly forms.
* **Analytics:** Track visitor → signup conversion.

---

## 6. Branding & Design

* **Style:** Modern SaaS aesthetic (inspired by Linear, Notion).
* **Typography:** JetBrains Mono / Inter.
* **Accent Color:** Indigo (`#5E5AE6`) or Teal (`#20BCA4`).
* **Imagery:** App mockups (not stock photos).
* **Logo:** Minimal infinity/chain icon, can be paired with wordmark.

---

## 7. Roadmap (Landing Page)

**Week 1**

* Copywriting (hero, features, wins, pricing).
* Visual assets (mockups, icons).

**Week 2**

* Static implementation (Rails view or static generator).
* Email capture integration (Mailchimp, ConvertKit, etc).
* Analytics setup.

**Week 3**

* Refine visuals (animation for streak grid, CTA polish).
* Launch to early adopters (social posts, beta invites).

---

## 8. Success Metrics

* **Conversion Rate:** % of visitors → email signups (target: 15–20%).
* **Traffic Growth:** Unique visitors per week.
* **Pro Awareness:** % of users scrolling to pricing.
* **Engagement:** Social shares of page / mockups.

---

## 9. Risks & Mitigation

* **Low signups:** Iterate on copy/visuals, add demo.
* **Unclear value prop:** A/B test headlines.
* **Overbuilding:** Stick to core flow, add proof/animations later.

---

✅ **Final Outcome:** A single-page site that tells JotChain’s story, showcases both *practical productivity wins* and *career/personal brand wins*, and drives early adoption.
