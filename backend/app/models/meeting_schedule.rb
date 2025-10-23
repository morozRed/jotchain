# frozen_string_literal: true

class MeetingSchedule < ApplicationRecord
  MEETING_TYPES = {
    daily_standup: "daily_standup",
    weekly_sync: "weekly_sync",
    monthly_review: "monthly_review"
  }.freeze

  WEEKDAY_NAMES = Date::DAYNAMES.freeze
  MONTH_WEEK_LABELS = {
    1 => "First",
    2 => "Second",
    3 => "Third",
    4 => "Fourth",
    5 => "Fifth"
  }.freeze

  belongs_to :user

  enum :meeting_type, MEETING_TYPES, suffix: true

  validates :meeting_type, inclusion: {in: MEETING_TYPES.values}
  validates :time_of_day, presence: true
  validates :lead_time_minutes, numericality: {greater_than_or_equal_to: 0, less_than_or_equal_to: 1440}
  validates :timezone, presence: true
  validate :timezone_is_valid
  validate :weekly_attributes_if_needed
  validate :monthly_attributes_if_needed

  scope :enabled, -> { where(enabled: true) }
  scope :ordered, -> { order(:meeting_type) }

  def next_occurrence(from: Time.current)
    tz = inferred_time_zone
    anchor = from.in_time_zone(tz)

    case meeting_type
    when MEETING_TYPES[:daily_standup]
      next_weekday_occurrence(anchor, tz)
    when MEETING_TYPES[:weekly_sync]
      next_weekly_occurrence(anchor, tz)
    when MEETING_TYPES[:monthly_review]
      next_monthly_occurrence(anchor, tz)
    else
      raise ArgumentError, "Unknown meeting type: #{meeting_type}"
    end
  end

  def next_summary_delivery(from: Time.current)
    occurrence = next_occurrence(from: from)
    occurrence - lead_time_minutes.minutes
  end

  def cadence_label
    case meeting_type
    when MEETING_TYPES[:daily_standup]
      "Every weekday"
    when MEETING_TYPES[:weekly_sync]
      "Every #{weekday_label}"
    when MEETING_TYPES[:monthly_review]
      "#{MONTH_WEEK_LABELS.fetch(monthly_week || 1, 'First')} #{weekday_label} of the month"
    else
      meeting_type.humanize
    end
  end

  def display_name
    meeting_type.humanize.titleize
  end

  def weekday_label
    WEEKDAY_NAMES.fetch((weekly_day || 1) % 7)
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

  private

  def timezone_is_valid
    return if timezone.blank?
    errors.add(:timezone, :invalid) unless ActiveSupport::TimeZone[timezone]
  end

  def weekly_attributes_if_needed
    return unless meeting_type == MEETING_TYPES[:weekly_sync] || meeting_type == MEETING_TYPES[:monthly_review]
    errors.add(:weekly_day, :blank) if weekly_day.nil?
    if weekly_day && !weekly_day.between?(0, 6)
      errors.add(:weekly_day, :inclusion, value: weekly_day)
    end
  end

  def monthly_attributes_if_needed
    return unless meeting_type == MEETING_TYPES[:monthly_review]
    self.monthly_week ||= 1
    unless monthly_week&.between?(1, 5)
      errors.add(:monthly_week, :inclusion, value: monthly_week)
    end
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

  def next_weekly_occurrence(anchor, tz)
    target_wday = weekly_day || 1
    date = anchor.to_date
    days_ahead = (target_wday - date.wday) % 7
    candidate_date = date + days_ahead
    candidate = combine(candidate_date, tz)
    candidate += 7.days if candidate <= anchor
    candidate
  end

  def next_monthly_occurrence(anchor, tz)
    target_wday = weekly_day || 1
    nth = monthly_week || 1

    year = anchor.year
    month = anchor.month
    candidate_date = nth_weekday_of_month(year, month, target_wday, nth)
    candidate = combine(candidate_date, tz)

    if candidate <= anchor
      month += 1
      if month > 12
        month = 1
        year += 1
      end
      candidate_date = nth_weekday_of_month(year, month, target_wday, nth)
      candidate = combine(candidate_date, tz)
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

  def nth_weekday_of_month(year, month, target_wday, nth)
    first_day = Date.new(year, month, 1)
    diff = (target_wday - first_day.wday) % 7
    day = 1 + diff + (nth - 1) * 7
    last_day = Date.civil(year, month, -1).day

    day -= 7 while day > last_day

    Date.new(year, month, day)
  end
end
