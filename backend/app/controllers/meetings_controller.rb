# frozen_string_literal: true

class MeetingsController < InertiaController
  def index
    schedules = current_schedules
    render inertia: "meetings/index", props: {
      meetingSchedules: schedule_payloads(schedules),
      meetingScheduleMeta: {
        timezone: Time.zone&.name || "UTC",
        meetingTypes: meeting_type_options
      },
      upcomingSummaries: upcoming_summary_payloads(schedules)
    }
  end

  private

  def schedule_payloads(schedules)
    schedules.map do |schedule|
      {
        id: schedule.id,
        meetingType: schedule.meeting_type,
        name: schedule.display_name,
        cadence: schedule.cadence_label,
        enabled: schedule.enabled,
        timeOfDay: schedule.time_of_day&.strftime("%H:%M"),
        timezone: schedule.timezone,
        weeklyDay: schedule.weekly_day,
        monthlyWeek: schedule.monthly_week,
        leadTimeMinutes: schedule.lead_time_minutes
      }
    end
  end

  def meeting_type_options
    MeetingSchedule::MEETING_TYPES.map do |key, value|
      {
        value: value,
        label: key.to_s.humanize.titleize
      }
    end
  end

  def upcoming_summary_payloads(schedules)
    schedules.filter(&:enabled).filter_map do |schedule|
      begin
        meeting_at = schedule.next_occurrence
        summary_at = schedule.next_summary_delivery
        {
          scheduleId: schedule.id,
          meetingType: schedule.meeting_type,
          name: schedule.display_name,
          cadence: schedule.cadence_label,
          summaryAt: summary_at.iso8601,
          summaryAtLabel: summary_at.in_time_zone(Time.zone).to_fs(:long),
          meetingAtLabel: meeting_at.in_time_zone(Time.zone).to_fs(:long)
        }
      rescue StandardError => e
        Rails.logger.warn("[MeetingSchedule] Unable to project next occurrence for schedule ##{schedule.id}: #{e.message}")
        nil
      end
    end.sort_by { |item| item.fetch(:summaryAt) }
  end

  def current_schedules
    Current.user.meeting_schedules.ordered
  end
end
