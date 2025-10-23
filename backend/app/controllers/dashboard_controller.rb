# frozen_string_literal: true

class DashboardController < InertiaController
  def index
    render inertia: "dashboard/index", props: {
      entries: entry_payloads,
      entryStats: entry_stats
    }
  end

  private

  def entry_payloads
    Current.user.entries.recent_first.limit(15).map do |entry|
      {
        id: entry.id,
        body: entry.body,
        tag: entry.tag,
        loggedAt: entry.logged_at&.iso8601,
        loggedAtLabel: entry.logged_at&.in_time_zone(Time.zone)&.to_fs(:long),
        createdAtAgo: view_context.time_ago_in_words(entry.created_at),
        createdAt: entry.created_at.iso8601
      }
    end
  end

  def entry_stats
    {
      count: Current.user.entries.count,
      lastLoggedAt: Current.user.entries.recent_first.first&.logged_at&.iso8601,
      currentStreak: Current.user.current_streak
    }
  end
end
