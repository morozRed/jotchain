# frozen_string_literal: true

class NotificationSchedule < ApplicationRecord
  CHANNELS = {
    email: "email"
  }.freeze

  RECURRENCES = {
    daily_weekdays: "daily_weekdays",
    weekly: "weekly",
    monthly_dom: "monthly_dom",
    custom: "custom"
  }.freeze

  CUSTOM_INTERVAL_UNITS = {
    days: "days",
    weeks: "weeks",
    months: "months"
  }.freeze

  LOOKBACK_TYPES = {
    day: "day",
    week: "week",
    month: "month",
    half_year: "half_year",
    year: "year",
    custom_days: "custom_days"
  }.freeze

  WEEKDAY_NAMES = Date::DAYNAMES.freeze

  belongs_to :user
  has_many :notification_deliveries, dependent: :destroy

  enum :channel, CHANNELS, suffix: true
  enum :recurrence, RECURRENCES, suffix: true
  enum :custom_interval_unit, CUSTOM_INTERVAL_UNITS, suffix: true, allow_nil: true
  enum :lookback_type, LOOKBACK_TYPES, suffix: true

  scope :ordered, -> { order(created_at: :asc) }
  scope :enabled, -> { where(enabled: true) }

  validates :name, presence: true
  validates :time_of_day, presence: true
  validates :timezone, presence: true
  validates :lead_time_minutes, numericality: {greater_than_or_equal_to: 0, less_than_or_equal_to: 1440}
  validates :weekly_day, inclusion: {in: 0..6}, allow_nil: true
  validates :day_of_month, inclusion: {in: 1..31}, allow_nil: true
  validates :custom_interval_value, numericality: {greater_than: 0}, allow_nil: true
  validates :lookback_days, numericality: {greater_than: 0, less_than_or_equal_to: 365}, allow_nil: true
  validate :timezone_is_valid
  validate :validate_recurrence_specifics
  validate :validate_custom_specifics
  validate :validate_lookback_specifics

  # Compute the next scheduled occurrence after the supplied timestamp.
  def next_occurrence(from: Time.current)
    tz = inferred_time_zone
    anchor = from.in_time_zone(tz)

    case recurrence
    when "daily_weekdays"
      next_weekday_occurrence(anchor, tz)
    when "weekly"
      ensure_weekly_day!
      next_weekly_occurrence(anchor, tz, weekly_day, 1)
    when "monthly_dom"
      ensure_day_of_month!
      next_monthly_occurrence(anchor, tz, day_of_month, 1)
    when "custom"
      next_custom_occurrence(anchor, tz)
    else
      raise ArgumentError, "Unknown recurrence: #{recurrence}"
    end
  end

  def summary_window(occurrence_at: Time.current)
    tz = inferred_time_zone
    anchor = occurrence_at.in_time_zone(tz)
    range_end = anchor
    range_start = case lookback_type
    when "day"
      range_end - 1.day
    when "week"
      range_end - 1.week
    when "month"
      range_end - 1.month
    when "half_year"
      range_end - 6.months
    when "year"
      range_end - 1.year
    when "custom_days"
      days = lookback_days.presence || 7
      range_end - days.days
    else
      range_end - 1.week
    end

    {
      start: range_start,
      end: range_end
    }
  end

  def lead_time_duration
    lead_time_minutes.minutes
  end

  # Return a list of future occurrences. Useful for previews.
  def next_occurrences(limit: 3, from: Time.current)
    occurrences = []
    cursor = from

    while occurrences.length < limit
      occurrence = next_occurrence(from: cursor)
      occurrences << occurrence
      cursor = occurrence + 1.second
    end

    occurrences
  end

  def inferred_time_zone
    ActiveSupport::TimeZone[timezone] || Time.find_zone!("UTC")
  end

  def time_of_day_components
    tod = time_of_day

    if tod.is_a?(String)
      zone = Time.zone || ActiveSupport::TimeZone["UTC"]
      tod = zone.parse(tod)
    end

    tod = tod.in_time_zone("UTC") if tod.respond_to?(:in_time_zone)
    {hour: tod.hour, min: tod.min, sec: tod.respond_to?(:sec) ? tod.sec : 0}
  end

  # Check if this schedule should include all projects (nil = all projects)
  def include_all_projects?
    included_project_ids.nil?
  end

  # Get the list of project IDs to include in summaries
  def project_filter
    return nil if include_all_projects? # nil means no filtering
    included_project_ids || []
  end

  private

  def timezone_is_valid
    return if timezone.blank?

    errors.add(:timezone, :invalid) unless ActiveSupport::TimeZone[timezone]
  end

  def validate_recurrence_specifics
    case recurrence
    when "weekly"
      errors.add(:weekly_day, :blank) if weekly_day.nil?
    when "monthly_dom"
      errors.add(:day_of_month, :blank) if day_of_month.nil?
    end
  end

  def validate_custom_specifics
    return unless recurrence == "custom"

    errors.add(:custom_interval_value, :blank) if custom_interval_value.blank?
    errors.add(:custom_interval_unit, :blank) if custom_interval_unit.blank?

    return if custom_interval_value.blank? || custom_interval_unit.blank?

    case custom_interval_unit
    when "weeks"
      errors.add(:weekly_day, :blank) if weekly_day.nil?
    when "months"
      errors.add(:day_of_month, :blank) if day_of_month.nil?
    end
  end

  def validate_lookback_specifics
    if lookback_type == "custom_days"
      errors.add(:lookback_days, :blank) if lookback_days.blank?
    elsif lookback_days.present?
      errors.add(:lookback_days, :present)
    end
  end

  def ensure_weekly_day!
    raise ArgumentError, "weekly_day missing" if weekly_day.nil?
  end

  def ensure_day_of_month!
    raise ArgumentError, "day_of_month missing" if day_of_month.nil?
  end

  def next_weekday_occurrence(anchor, tz)
    date = anchor.to_date
    candidate = combine(date, tz)

    while candidate <= anchor || weekend?(candidate)
      date += 1.day
      candidate = combine(date, tz)
    end

    candidate
  end

  def next_weekly_occurrence(anchor, tz, target_wday, week_step)
    date = anchor.to_date
    days_ahead = (target_wday - date.wday) % 7
    candidate_date = date + days_ahead
    candidate = combine(candidate_date, tz)

    step = 7 * week_step
    while candidate <= anchor
      candidate += step.days
    end

    candidate
  end

  def next_monthly_occurrence(anchor, tz, dom, month_step)
    year = anchor.year
    month = anchor.month
    candidate_date = normalize_day_of_month(year, month, dom)
    candidate = combine(candidate_date, tz)

    while candidate <= anchor
      month += month_step
      year += (month - 1) / 12
      month = ((month - 1) % 12) + 1
      candidate_date = normalize_day_of_month(year, month, dom)
      candidate = combine(candidate_date, tz)
    end

    candidate
  end

  def next_custom_occurrence(anchor, tz)
    value = custom_interval_value
    unit = custom_interval_unit
    raise ArgumentError, "Custom interval value missing" if value.blank?
    raise ArgumentError, "Custom interval unit missing" if unit.blank?

    case unit
    when "days"
      next_custom_daily_occurrence(anchor, tz, value)
    when "weeks"
      ensure_weekly_day!
      next_weekly_occurrence(anchor, tz, weekly_day, value)
    when "months"
      ensure_day_of_month!
      next_monthly_occurrence(anchor, tz, day_of_month, value)
    else
      raise ArgumentError, "Unknown custom interval unit: #{unit}"
    end
  end

  def next_custom_daily_occurrence(anchor, tz, step_days)
    date = anchor.to_date
    candidate = combine(date, tz)

    while candidate <= anchor
      candidate += step_days.days
    end

    candidate
  end

  def combine(date, tz)
    tod = time_of_day_components
    tz.local(date.year, date.month, date.day, tod[:hour], tod[:min], tod[:sec])
  end

  def weekend?(time)
    time.saturday? || time.sunday?
  end

  def normalize_day_of_month(year, month, dom)
    last_day = Date.civil(year, month, -1).day
    target_day = [[dom, last_day].compact.min, 1].max
    Date.new(year, month, target_day)
  end
end
