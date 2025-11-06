# frozen_string_literal: true

require "securerandom"

require_relative "preview_data"

class SummaryMailerPreview < ActionMailer::Preview
  include PreviewData

  # Comprehensive multi-project summary with collaboration
  def rich_multi_project
    SummaryMailer.with(delivery: preview_delivery(payload_type: :rich_multi_project)).digest
  end

  # Focused single project with depth
  def single_project_focus
    SummaryMailer.with(delivery: preview_delivery(payload_type: :single_project)).digest
  end

  # Heavy collaboration across projects
  def collaboration_heavy
    SummaryMailer.with(delivery: preview_delivery(payload_type: :collaboration)).digest
  end

  # Minimal activity period
  def minimal_activity
    SummaryMailer.with(delivery: preview_delivery(payload_type: :minimal)).digest
  end

  # Legacy format (original preview)
  def digest
    SummaryMailer.with(delivery: preview_delivery(payload_type: :legacy)).digest
  end

  private

  def preview_delivery(payload_type: :rich_multi_project)
    user = preview_user
    schedule = NotificationSchedule.new(
      user:,
      name: schedule_name(payload_type),
      channel: :email,
      enabled: true,
      timezone: "America/New_York",
      time_of_day: Time.zone.parse("09:30"),
      recurrence: :weekly,
      weekly_day: 1,
      lookback_type: :week,
      lead_time_minutes: 30
    )

    window_end = Time.zone.now.change(hour: 9, min: 0)
    window_start = window_end - 5.days
    occurrence_at = window_end + 30.minutes

    NotificationDelivery.new(
      user:,
      notification_schedule: schedule,
      occurrence_at:,
      trigger_at: occurrence_at - schedule.lead_time_minutes.minutes,
      window_start:,
      window_end:,
      status: :delivered,
      summary_payload: preview_payload(window_start:, window_end:, type: payload_type),
      summary_model: "gpt-4o-mini",
      prompt_tokens: 412,
      completion_tokens: 168
    )
  end

  def schedule_name(type)
    case type
    when :rich_multi_project then "Weekly Sync"
    when :single_project then "Backend Deep Dive"
    when :collaboration then "Team Standup"
    when :minimal then "Daily Context"
    else "Weekly Sync"
    end
  end

  def preview_payload(window_start:, window_end:, type: :rich_multi_project)
    case type
    when :rich_multi_project
      rich_multi_project_payload(window_start, window_end)
    when :single_project
      single_project_payload(window_start, window_end)
    when :collaboration
      collaboration_payload(window_start, window_end)
    when :minimal
      minimal_payload(window_start, window_end)
    else
      legacy_payload(window_start, window_end)
    end
  end

  def rich_multi_project_payload(window_start, window_end)
    {
      status: "ok",
      window: { start: window_start, end: window_end },
      projects: [
        { id: SecureRandom.uuid, name: "Backend", color: "#818cf8", entry_count: 8 },
        { id: SecureRandom.uuid, name: "Frontend", color: "#38bdf8", entry_count: 5 },
        { id: SecureRandom.uuid, name: "Mobile", color: "#22d3ee", entry_count: 4 },
        { id: SecureRandom.uuid, name: "Payments", color: "#f472b6", entry_count: 3 }
      ],
      top_collaborators: [
        { id: SecureRandom.uuid, name: "Sarah", mention_count: 5 },
        { id: SecureRandom.uuid, name: "Mike", mention_count: 3 },
        { id: SecureRandom.uuid, name: "Alex", mention_count: 2 }
      ],
      sections: [
        {
          title: "Shipped",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Fixed auth timeout affecting 200+ enterprise users",
            "Deployed database migration for user preferences with @Sarah",
            "Optimized API response times by 40%"
          ]
        },
        {
          title: "In Progress",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Refactoring authentication middleware with @Mike",
            "Building webhook retry mechanism"
          ]
        },
        {
          title: "Shipped",
          project: { name: "Frontend", color: "#38bdf8" },
          bullets: [
            "Completed responsive dashboard redesign",
            "Implemented dark mode toggle with @Sarah",
            "Fixed mobile navigation collapse bug"
          ]
        },
        {
          title: "In Progress",
          project: { name: "Mobile", color: "#22d3ee" },
          bullets: [
            "Building offline sync functionality",
            "Optimizing app launch time with @Alex"
          ]
        },
        {
          title: "Blockers",
          project: { name: "Mobile", color: "#22d3ee" },
          bullets: [
            "Waiting on App Store review for version 2.1"
          ]
        },
        {
          title: "Shipped",
          project: { name: "Payments", color: "#f472b6" },
          bullets: [
            "Integrated Stripe webhooks with @Alex",
            "Added invoice generation feature"
          ]
        }
      ],
      stats: {
        current_streak: 7,
        total_notes: 20,
        most_productive_day: (window_end - 2.days).strftime("%a, %b %-d")
      },
      source_entries: []
    }
  end

  def single_project_payload(window_start, window_end)
    {
      status: "ok",
      window: { start: window_start, end: window_end },
      projects: [
        { id: SecureRandom.uuid, name: "Backend", color: "#818cf8", entry_count: 15 }
      ],
      top_collaborators: [
        { id: SecureRandom.uuid, name: "Sarah", mention_count: 8 },
        { id: SecureRandom.uuid, name: "Mike", mention_count: 6 }
      ],
      sections: [
        {
          title: "Shipped",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Completed authentication service refactor with @Sarah",
            "Deployed rate limiting to prevent API abuse",
            "Fixed memory leak in background job processor",
            "Added comprehensive logging for debugging"
          ]
        },
        {
          title: "In Progress",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Building new caching layer with Redis",
            "Migrating to async job processing with @Mike",
            "Implementing GraphQL federation"
          ]
        },
        {
          title: "Testing",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Load testing new API endpoints",
            "Validating database migration rollback with @Sarah"
          ]
        },
        {
          title: "Blockers",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Redis connection pooling issue in staging environment",
            "Need infrastructure team approval for production deployment"
          ]
        }
      ],
      stats: {
        current_streak: 12,
        total_notes: 15,
        most_productive_day: (window_end - 1.day).strftime("%a, %b %-d")
      },
      source_entries: []
    }
  end

  def collaboration_payload(window_start, window_end)
    {
      status: "ok",
      window: { start: window_start, end: window_end },
      projects: [
        { id: SecureRandom.uuid, name: "Backend", color: "#818cf8", entry_count: 6 },
        { id: SecureRandom.uuid, name: "Frontend", color: "#38bdf8", entry_count: 5 },
        { id: SecureRandom.uuid, name: "Design System", color: "#a855f7", entry_count: 4 }
      ],
      top_collaborators: [
        { id: SecureRandom.uuid, name: "Sarah", mention_count: 12 },
        { id: SecureRandom.uuid, name: "Mike", mention_count: 9 },
        { id: SecureRandom.uuid, name: "Alex", mention_count: 7 },
        { id: SecureRandom.uuid, name: "Jordan", mention_count: 5 }
      ],
      sections: [
        {
          title: "Collaboration",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Paired with @Sarah on API authentication flow",
            "Code review session with @Mike for webhook implementation",
            "Reviewed @Alex's database migration PR"
          ]
        },
        {
          title: "Shipped",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Deployed rate limiting with @Sarah's security improvements"
          ]
        },
        {
          title: "Collaboration",
          project: { name: "Frontend", color: "#38bdf8" },
          bullets: [
            "Design sync with @Jordan on component library",
            "Mob programming session with @Sarah and @Mike on state management",
            "Reviewed @Alex's accessibility improvements"
          ]
        },
        {
          title: "Shipped",
          project: { name: "Frontend", color: "#38bdf8" },
          bullets: [
            "Implemented new button variants with @Jordan's designs"
          ]
        },
        {
          title: "Planning",
          project: { name: "Design System", color: "#a855f7" },
          bullets: [
            "Architecture discussion with @Sarah and @Jordan",
            "Defined component API standards with @Mike",
            "Documented design tokens with @Alex"
          ]
        }
      ],
      stats: {
        current_streak: 5,
        total_notes: 15,
        most_productive_day: (window_end - 3.days).strftime("%a, %b %-d")
      },
      source_entries: []
    }
  end

  def minimal_payload(window_start, window_end)
    {
      status: "ok",
      window: { start: window_start, end: window_end },
      projects: [
        { id: SecureRandom.uuid, name: "Backend", color: "#818cf8", entry_count: 2 }
      ],
      top_collaborators: [],
      sections: [
        {
          title: "In Progress",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Investigating production performance regression"
          ]
        },
        {
          title: "Blockers",
          project: { name: "Backend", color: "#818cf8" },
          bullets: [
            "Waiting on database migration approval from DBA team"
          ]
        }
      ],
      stats: {
        current_streak: 2,
        total_notes: 2,
        most_productive_day: (window_end - 1.day).strftime("%a, %b %-d")
      },
      source_entries: []
    }
  end

  def legacy_payload(window_start, window_end)
    {
      status: "ok",
      window: { start: window_start, end: window_end },
      sections: [
        {
          title: "Shipped",
          bullets: [
            "Rolled out onboarding checklist to 100% of new users.",
            "Closed production auth timeout impacting enterprise logins."
          ]
        },
        {
          title: "Collaboration",
          bullets: [
            "Reviewed 6 pull requests for platform team.",
            "Paired with design on entry timeline polish."
          ]
        },
        {
          title: "Blockers",
          bullets: [
            "Investigating staging database CPU spikes before release."
          ]
        }
      ],
      stats: {
        current_streak: 5,
        total_notes: 18,
        most_productive_day: (window_end - 2.days).strftime("%a, %b %-d")
      },
      source_entries: [
        {
          id: SecureRandom.uuid,
          logged_at: (window_end - 2.days).iso8601,
          tag: "backend",
          body: "Shipped onboarding checklist with progressive rollout safeguards."
        },
        {
          id: SecureRandom.uuid,
          logged_at: (window_end - 1.day).iso8601,
          tag: "platform",
          body: "Resolved auth timeout and backfilled missed metrics."
        },
        {
          id: SecureRandom.uuid,
          logged_at: (window_end - 4.hours).iso8601,
          tag: "infra",
          body: "Paired with design to polish entry timeline and metrics."
        }
      ]
    }
  end
end
