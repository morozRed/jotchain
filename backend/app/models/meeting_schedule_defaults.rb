# frozen_string_literal: true

module MeetingScheduleDefaults
  DEFAULTS = [
    {
      meeting_type: MeetingSchedule::MEETING_TYPES[:daily_standup],
      time_of_day: "09:00",
      lead_time_minutes: 30
    },
    {
      meeting_type: MeetingSchedule::MEETING_TYPES[:weekly_sync],
      time_of_day: "14:00",
      weekly_day: 5, # Friday
      lead_time_minutes: 45
    },
    {
      meeting_type: MeetingSchedule::MEETING_TYPES[:monthly_review],
      time_of_day: "10:00",
      weekly_day: 1, # Monday
      monthly_week: 1, # First week
      lead_time_minutes: 60
    }
  ].freeze

  module_function

  def apply!(user, timezone: nil)
    tz_name = timezone.presence || default_timezone

    DEFAULTS.each do |config|
      schedule = user.meeting_schedules.find_or_initialize_by(meeting_type: config.fetch(:meeting_type))
      schedule.assign_attributes(default_attributes(config).merge(timezone: tz_name))
      schedule.enabled = true if schedule.enabled.nil?
      schedule.save!
    end
  end

  def default_timezone
    Time.zone&.name || "UTC"
  end

  def default_attributes(config)
    config.except(:meeting_type)
  end
end
