# frozen_string_literal: true

class DashboardController < InertiaController
  def index
    render inertia: "dashboard/index", props: {
      entries: entry_payloads,
      entryStats: entry_stats,
      selectedDate: selected_date.to_s,
      previousDate: (selected_date - 1.day).to_s,
      nextDate: (selected_date + 1.day).to_s,
      isToday: selected_date == Date.current,
      selectedDateFormatted: selected_date.strftime("%B %-d, %Y")
    }
  end

  private

  def selected_date
    @selected_date ||= if params[:date].present?
      Date.parse(params[:date])
    else
      Date.current
    end
  rescue ArgumentError
    Date.current
  end

  def entry_payloads
    entries = Current.user.entries.recent_first

    # Filter entries for the selected date
    start_time = selected_date.beginning_of_day
    end_time = selected_date.end_of_day
    entries = entries.for_period(start_time..end_time)

    entries.map do |entry|
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
