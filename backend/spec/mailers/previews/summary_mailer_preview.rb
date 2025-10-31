# frozen_string_literal: true

require "securerandom"

require_relative "preview_data"

class SummaryMailerPreview < ActionMailer::Preview
  include PreviewData

  def digest
    SummaryMailer.with(delivery: preview_delivery).digest
  end

  private

  def preview_delivery
    user = preview_user
    schedule = NotificationSchedule.new(
      user:,
      name: "Weekly Sync",
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
      summary_payload: preview_payload(window_start:, window_end:),
      summary_model: "gpt-4o-mini",
      prompt_tokens: 412,
      completion_tokens: 168
    )
  end

  def preview_payload(window_start:, window_end:)
    {
      status: "ok",
      window: {
        start: window_start,
        end: window_end
      },
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
        most_productive_day: (window_end - 2.days).strftime("%A, %b %-d")
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
