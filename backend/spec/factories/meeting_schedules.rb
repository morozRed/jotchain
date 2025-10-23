# frozen_string_literal: true

FactoryBot.define do
  factory :meeting_schedule do
    association :user

    meeting_type { MeetingSchedule::MEETING_TYPES[:daily_standup] }
    enabled { true }
    time_of_day { "09:00" }
    timezone { "UTC" }
    lead_time_minutes { 30 }

    trait :weekly_sync do
      meeting_type { MeetingSchedule::MEETING_TYPES[:weekly_sync] }
      weekly_day { 5 }
      time_of_day { "14:00" }
      lead_time_minutes { 45 }
    end

    trait :monthly_review do
      meeting_type { MeetingSchedule::MEETING_TYPES[:monthly_review] }
      weekly_day { 1 }
      monthly_week { 1 }
      time_of_day { "10:00" }
      lead_time_minutes { 60 }
    end
  end
end
