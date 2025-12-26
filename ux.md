# User Journey to First Aha Moment

## Goal
User sees a signal that matches their lived experience and takes a small action
(expand signal, add a note, or reflect).

## Aha Definition
- "I did not realize how much time went to X."
- "This blocker showed up more than I thought."
- Action: expand + reflect, or expand + add note.

## Journey Timeline

### Day 0: Onboarding
- User signs up, lands on Log page.
- Empty state copy sets expectations: "Signals appear after a few days."
- Prompt: "What happened today?" with a single writing surface.

### Day 1-3: Capture
- User writes short notes, optional @mentions.
- Signals bar stays collapsed or hidden (no premature feedback).
- Subtle nudge: "2-4 short notes are usually enough."

### Day 4-7: First Signal
- System detects a repeated pattern (threshold met).
- Thin signals bar appears with a count and a subtle highlight.
- Example: "Blockers (3)".
- User clicks to expand, sees evidence list and linked notes.

### Immediate Action
- User chooses:
  - "Add note" (linked as evidence).
  - "Reflect" (linked as reflection).
  - "Ignore" (signal status = ignored).

### Confirmation
- After reflection, signal shows "acknowledged" or "resolved."
- Passive insight text appears: "This week felt fragmented. Interruptions appeared in 4 notes."

## UX Surfaces
- Log page: primary capture surface + signal bar.
- Signal panel: evidence list + linked notes + actions.
- Reflection: normal note editor with auto-link.

## Triggers and Thresholds
- Minimum data threshold per signal type (configurable).
- Confidence threshold required before surfacing.
- Soft highlight for first signal to invite curiosity.

## Instrumentation
- Signals surfaced per user.
- Expand rate per signal type.
- Add note / reflect actions taken.
- Time to first signal and time to first reflection.
