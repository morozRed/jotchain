# frozen_string_literal: true

class NotificationsController < InertiaController
  TIMEZONE_PRESETS = [
    "UTC",
    "America/Los_Angeles",
    "America/New_York",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Singapore"
  ].freeze

  before_action :set_notification, only: [:update, :destroy]

  def index
    schedules = Current.user.notification_schedules.ordered

    render inertia: "notifications/index", props: {
      notificationSchedules: schedule_payloads(schedules),
      notificationScheduleMeta: meta_payload
    }
  end

  def create
    schedule = Current.user.notification_schedules.build(schedule_params)

    if schedule.save
      redirect_to notifications_path, notice: "Notification created"
    else
      redirect_to notifications_path, inertia: inertia_errors(schedule)
    end
  end

  def update
    if @notification.update(schedule_params)
      notice_message = if schedule_params.key?(:enabled) && schedule_params.keys.size == 1
        schedule_params[:enabled] ? "Notification enabled" : "Notification disabled"
      else
        "Notification updated"
      end
      redirect_to notifications_path, notice: notice_message
    else
      redirect_to notifications_path, inertia: inertia_errors(@notification)
    end
  end

  def destroy
    @notification.destroy
    redirect_to notifications_path, notice: "Notification deleted"
  end

  private

  BOOLEAN_TYPE = ActiveModel::Type::Boolean.new

  def set_notification
    @notification = Current.user.notification_schedules.find(params[:id])
  end

  def schedule_params
    permitted = params.require(:notification_schedule).permit(
      :name,
      :channel,
      :enabled,
      :timezone,
      :time_of_day,
      :recurrence,
      :weekly_day,
      :day_of_month,
      :custom_interval_value,
      :custom_interval_unit,
      :lookback_type,
      :lookback_days,
      :lead_time_minutes
    )

    permitted[:channel] = permitted[:channel].presence || NotificationSchedule::CHANNELS[:email]

    if permitted.key?(:enabled)
      permitted[:enabled] = BOOLEAN_TYPE.cast(permitted[:enabled])
    end

    permitted[:weekly_day] = normalize_integer(permitted[:weekly_day])
    permitted[:day_of_month] = normalize_integer(permitted[:day_of_month])
    permitted[:custom_interval_value] = normalize_integer(permitted[:custom_interval_value])
    permitted[:lookback_days] = normalize_integer(permitted[:lookback_days])
    permitted[:lead_time_minutes] = normalize_integer(permitted[:lead_time_minutes])

    permitted[:custom_interval_unit] = permitted[:custom_interval_unit].presence
    permitted[:recurrence] = permitted[:recurrence].presence
    permitted[:lookback_type] = permitted[:lookback_type].presence || NotificationSchedule::LOOKBACK_TYPES[:week]

    permitted.to_h.compact_blank
  end

  def normalize_integer(value)
    return if value.blank?

    Integer(value, exception: false)
  end

  def schedule_payloads(schedules)
    schedules.map do |schedule|
      next_occurrences = schedule.next_occurrences(limit: 3).map(&:iso8601)

      {
        id: schedule.id,
        name: schedule.name,
        enabled: schedule.enabled,
        channel: schedule.channel,
        timezone: schedule.timezone,
        timeOfDay: schedule.time_of_day&.strftime("%H:%M"),
        recurrence: schedule.recurrence,
        weeklyDay: schedule.weekly_day,
        dayOfMonth: schedule.day_of_month,
        customIntervalValue: schedule.custom_interval_value,
        customIntervalUnit: schedule.custom_interval_unit,
        lookbackType: schedule.lookback_type,
        lookbackDays: schedule.lookback_days,
        leadTimeMinutes: schedule.lead_time_minutes,
        nextOccurrences: next_occurrences,
        createdAt: schedule.created_at.iso8601
      }
    end
  end

  def meta_payload
    {
      timezone: Time.zone&.name || "UTC",
      timezonePresets: TIMEZONE_PRESETS,
      weekdayOptions: NotificationSchedule::WEEKDAY_NAMES.each_with_index.map { |label, value| {value:, label:} },
      recurrenceOptions: NotificationSchedule::RECURRENCES.keys,
      customIntervalUnitOptions: NotificationSchedule::CUSTOM_INTERVAL_UNITS.keys,
      lookbackPresets: NotificationSchedule::LOOKBACK_TYPES.keys - [:custom_days],
      defaultWeeklyDay: 1
    }
  end
end
