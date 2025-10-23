# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  generates_token_for :email_verification, expires_in: 2.days do
    email
  end

  generates_token_for :password_reset, expires_in: 20.minutes do
    password_salt.last(10)
  end


  has_many :entries, dependent: :destroy
  has_many :meeting_schedules, dependent: :destroy
  has_many :sessions, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: {with: URI::MailTo::EMAIL_REGEXP}
  validates :password, allow_nil: true, length: {minimum: 12}

  normalizes :email, with: -> { _1.strip.downcase }

  before_validation if: :email_changed?, on: :update do
    self.verified = false
  end

  after_update if: :password_digest_previously_changed? do
    sessions.where.not(id: Current.session).delete_all
  end

  after_create :ensure_default_meeting_schedules

  def schedule_for(meeting_type)
    meeting_schedules.find_by(meeting_type:)
  end

  def current_streak
    return 0 if entries.empty?

    # Get all unique dates with entries, sorted descending
    entry_dates = entries
      .pluck(:logged_at)
      .map { |dt| dt.in_time_zone(Time.zone).to_date }
      .uniq
      .sort
      .reverse

    return 0 if entry_dates.empty?

    today = Time.current.in_time_zone(Time.zone).to_date

    # If the most recent entry is not today or yesterday, streak is 0
    return 0 unless [today, today - 1.day].include?(entry_dates.first)

    # Count consecutive days backward from the most recent entry
    streak = 0
    current_date = entry_dates.first

    entry_dates.each do |date|
      if date == current_date
        streak += 1
        current_date -= 1.day
      else
        break
      end
    end

    streak
  end

  private

  def ensure_default_meeting_schedules
    MeetingScheduleDefaults.apply!(self)
  end
end
