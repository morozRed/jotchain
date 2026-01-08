# GitHub Metrics Specification

This document defines the formulas, thresholds, and guardrails for all GitHub-derived metrics in JotChain.

## Rolling Window Periods

All metrics are computed over rolling windows:
- **7 days**: Short-term activity snapshot
- **14 days**: Sprint-aligned view (common 2-week sprints)
- **30 days**: Monthly trend baseline

Weekly historical snapshots are stored for long-term trend analysis.

---

## Core Metrics

### 1. Throughput

**Definition**: Number of pull requests merged within a time period.

**Formula**:
```
throughput = COUNT(merged_prs) WHERE merged_at BETWEEN period_start AND period_end
```

**Per-Contributor**:
```
contributor_throughput = COUNT(merged_prs) WHERE author_id = contributor AND merged_at IN period
```

**Team Aggregate**:
```
team_throughput = SUM(contributor_throughput) for all contributors
```

**Interpretation**:
- Higher throughput generally indicates healthy delivery velocity
- Should be viewed alongside cycle time (fast throughput with long cycle time = batched merges)
- Normalize by team size for cross-team comparisons

---

### 2. Cycle Time

**Definition**: Time elapsed from PR opened to PR merged.

**Formula**:
```
cycle_time = merged_at - opened_at (in hours)
```

**Per-PR**:
```
pr_cycle_time = pr.merged_at - pr.opened_at
```

**Per-Contributor (median)**:
```
contributor_cycle_time = MEDIAN(pr_cycle_time) WHERE author_id = contributor AND merged_at IN period
```

**Team Aggregate (median)**:
```
team_cycle_time = MEDIAN(pr_cycle_time) for all merged PRs in period
```

**Why Median**: Cycle time distributions are typically skewed (a few long-lived PRs). Median provides a representative value.

**Interpretation**:
- Lower cycle time indicates faster feedback loops
- High cycle time may indicate: large PRs, review bottlenecks, blocked work, or external dependencies

**Guardrails**:
| Threshold | Classification | Action |
|-----------|----------------|--------|
| < 24 hours | Excellent | None |
| 24-72 hours | Healthy | None |
| 72-168 hours (3-7 days) | Needs attention | Surface in signals |
| > 168 hours (7+ days) | Concern | Highlight as bottleneck |

---

### 3. Review Turnaround Time

**Definition**: Time from PR opened to first review submitted.

**Formula**:
```
review_turnaround = first_review_at - opened_at (in hours)
```

**Per-PR**:
```
pr_review_turnaround = MIN(review.submitted_at) - pr.opened_at WHERE review.pr_id = pr.id
```

**Per-Contributor (as author, median)**:
```
author_review_wait = MEDIAN(pr_review_turnaround) WHERE pr.author_id = contributor
```

**Per-Contributor (as reviewer, median)**:
```
reviewer_response_time = MEDIAN(review.submitted_at - pr.opened_at) WHERE review.reviewer_id = contributor
```

**Interpretation**:
- Long review turnaround blocks authors and increases context-switching cost
- Short turnaround indicates healthy team collaboration

**Guardrails**:
| Threshold | Classification | Action |
|-----------|----------------|--------|
| < 4 hours | Excellent | None |
| 4-24 hours | Healthy | None |
| 24-48 hours | Needs attention | Surface in signals |
| > 48 hours | Concern | Highlight as review bottleneck |

---

### 4. Review Load

**Definition**: Balance between reviews given and reviews received.

**Formulas**:
```
reviews_given = COUNT(reviews) WHERE reviewer_id = contributor AND submitted_at IN period
reviews_received = COUNT(reviews) WHERE pr.author_id = contributor AND submitted_at IN period
```

**Review Load Ratio**:
```
review_load_ratio = reviews_given / MAX(reviews_received, 1)
```

**Interpretation**:
- Ratio > 1.5: Contributor is a net reviewer (may be overloaded)
- Ratio 0.7-1.5: Balanced
- Ratio < 0.7: Contributor receives more reviews than gives (may need to contribute more to reviews)

**Team Distribution**:
```
review_distribution_variance = VARIANCE(reviews_given) across all contributors
```

High variance indicates uneven review load.

**Guardrails**:
| Ratio | Classification | Signal |
|-------|----------------|--------|
| > 2.0 | Heavy reviewer | "High review load" |
| < 0.5 | Low reviewer | "Low review participation" |
| Variance > threshold | Uneven | "Uneven review distribution" |

---

### 5. Work in Progress (WIP)

**Definition**: Count of open PRs and their age.

**Formulas**:
```
wip_count = COUNT(prs) WHERE state = 'open' AND author_id = contributor
wip_age_avg = AVG(NOW() - opened_at) for open PRs
wip_age_max = MAX(NOW() - opened_at) for open PRs
```

**Team Aggregate**:
```
team_wip = COUNT(prs) WHERE state = 'open'
team_wip_age = AVG(NOW() - opened_at) for all open PRs
```

**Interpretation**:
- High WIP count may indicate blocked work or context-switching
- Old open PRs are "stale" and need attention

**Guardrails**:
| WIP Count | Classification | Signal |
|-----------|----------------|--------|
| 1-2 | Healthy | None |
| 3-4 | Elevated | "Multiple PRs in flight" |
| 5+ | High | "High WIP count" |

---

## Derived Signals

Signals are actionable alerts derived from metric thresholds.

### Stale PR

**Definition**: Open PR with no activity beyond a threshold.

**Formula**:
```
is_stale = (state = 'open') AND (last_activity_at < NOW() - stale_threshold)
```

Where `last_activity_at` is the most recent of:
- `opened_at`
- Latest commit timestamp
- Latest review `submitted_at`
- Latest comment timestamp (if tracked)

**Thresholds**:
| Days Since Activity | Classification |
|---------------------|----------------|
| 3-7 days | Warning ("Needs attention") |
| 7+ days | Stale ("No recent activity") |
| 14+ days | Critical ("Abandoned?") |

---

### Review Bottleneck

**Definition**: PR waiting for review beyond acceptable threshold.

**Formula**:
```
is_review_bottleneck = (state = 'open') AND (first_review_at IS NULL) AND (NOW() - opened_at > review_wait_threshold)
```

**Thresholds**:
| Hours Waiting | Classification |
|---------------|----------------|
| 24-48 hours | Warning |
| 48+ hours | Bottleneck |

---

### Throughput Drop

**Definition**: Significant decrease in throughput compared to prior period.

**Formula**:
```
throughput_change = (current_period_throughput - prior_period_throughput) / MAX(prior_period_throughput, 1)
is_throughput_drop = throughput_change < -0.30
```

**Threshold**: > 30% drop triggers signal.

---

### Uneven Review Load

**Definition**: Review work is concentrated among few contributors.

**Formula**:
```
gini_coefficient = calculate_gini(reviews_given for each contributor)
is_uneven = gini_coefficient > 0.4
```

Alternative (simpler):
```
top_reviewer_share = MAX(reviews_given) / SUM(reviews_given)
is_uneven = top_reviewer_share > 0.5  # One person doing >50% of reviews
```

---

## Aggregate Team Metrics

### Team Health Summary

```json
{
  "period": "7d",
  "throughput": 12,
  "throughput_trend": "+15%",
  "cycle_time_median_hours": 36,
  "review_turnaround_median_hours": 8,
  "open_prs": 5,
  "stale_prs": 1,
  "review_bottlenecks": 0,
  "active_contributors": 4
}
```

### Leaderboard Metrics (Optional, Use Carefully)

If enabled, show context alongside numbers:
- Throughput leaders (with "also top reviewer" context)
- Review contributors (reviews given)
- Avoid single "productivity score"

---

## Guardrail Philosophy

1. **Trends over absolutes**: A contributor with low throughput but improving trend is different from declining throughput.
2. **Context matters**: High cycle time during holidays is expected.
3. **No single score**: Multiple dimensions prevent gaming and provide nuance.
4. **Signals, not judgments**: "PR waiting 3 days for review" is actionable. "John is unproductive" is not.

---

## Metric Storage

Metrics are computed and stored in `github_metric_snapshots`:

```ruby
# Per-contributor snapshot
{
  workspace_id: uuid,
  github_contributor_id: uuid,
  period_type: "rolling_7d",  # or rolling_14d, rolling_30d, weekly
  period_start: date,
  period_end: date,
  metrics: {
    throughput: 3,
    cycle_time_median_hours: 28,
    review_turnaround_median_hours: 6,
    reviews_given: 8,
    reviews_received: 5,
    review_load_ratio: 1.6,
    wip_count: 2,
    commits: 15,
    additions: 450,
    deletions: 120
  },
  computed_at: timestamp
}

# Team aggregate snapshot (github_contributor_id = null)
{
  workspace_id: uuid,
  github_contributor_id: null,
  period_type: "rolling_7d",
  metrics: {
    team_throughput: 12,
    team_cycle_time_median_hours: 32,
    team_review_turnaround_median_hours: 8,
    total_reviews: 45,
    open_prs: 5,
    stale_prs: 1,
    active_contributors: 4
  }
}
```

---

## Configuration Defaults

These thresholds are defaults and may be configurable per-workspace in the future:

```ruby
METRIC_DEFAULTS = {
  stale_pr_warning_days: 3,
  stale_pr_critical_days: 7,
  review_bottleneck_hours: 48,
  cycle_time_concern_hours: 168,
  throughput_drop_threshold: 0.30,
  review_load_high_ratio: 2.0,
  review_load_low_ratio: 0.5,
  wip_elevated_count: 3,
  wip_high_count: 5
}.freeze
```
