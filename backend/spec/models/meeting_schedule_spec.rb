# frozen_string_literal: true

require "rails_helper"

RSpec.describe MeetingSchedule, type: :model do
  describe "validations" do
    it "has a valid factory" do
      expect(build(:meeting_schedule)).to be_valid
    end

    it "requires weekly_day for weekly sync" do
      schedule = build(:meeting_schedule, :weekly_sync, weekly_day: nil)

      expect(schedule).not_to be_valid
      expect(schedule.errors[:weekly_day]).to include("can't be blank")
    end

    it "requires monthly_week for monthly review" do
      schedule = build(:meeting_schedule, :monthly_review, monthly_week: nil)

      expect(schedule).not_to be_valid
      expect(schedule.errors[:monthly_week]).to include("is not included in the list")
    end
  end

  describe "#next_occurrence" do
    it "skips weekends for daily standup" do
      schedule = create(
        :meeting_schedule,
        meeting_type: MeetingSchedule::MEETING_TYPES[:daily_standup],
        time_of_day: "09:00",
        timezone: "UTC",
      )

      travel_to(Time.zone.parse("2025-02-14 17:00 UTC")) do # Friday evening
        expect(schedule.next_occurrence).to eq(Time.zone.parse("2025-02-17 09:00 UTC"))
      end
    end

    it "targets configured weekday for weekly sync" do
      schedule = create(
        :meeting_schedule,
        :weekly_sync,
        weekly_day: 2,
        time_of_day: "10:30",
        timezone: "UTC",
      )

      travel_to(Time.zone.parse("2025-02-10 09:00 UTC")) do # Monday morning
        expect(schedule.next_occurrence).to eq(Time.zone.parse("2025-02-11 10:30 UTC"))
      end
    end

    it "respects monthly ordinal" do
      schedule = create(
        :meeting_schedule,
        :monthly_review,
        weekly_day: 1,
        monthly_week: 1,
        time_of_day: "10:00",
        timezone: "UTC",
      )

      travel_to(Time.zone.parse("2025-02-04 12:00 UTC")) do # After February's first Monday
        expect(schedule.next_occurrence).to eq(Time.zone.parse("2025-03-03 10:00 UTC"))
      end
    end
  end

  describe "#next_summary_delivery" do
    it "subtracts lead time minutes from the next occurrence" do
      schedule = create(
        :meeting_schedule,
        meeting_type: MeetingSchedule::MEETING_TYPES[:daily_standup],
        time_of_day: "09:00",
        lead_time_minutes: 45,
        timezone: "UTC",
      )

      travel_to(Time.zone.parse("2025-02-18 08:15 UTC")) do
        expect(schedule.next_summary_delivery).to eq(Time.zone.parse("2025-02-18 08:15 UTC"))
      end
    end
  end

  describe "#cadence_label" do
    it "returns human readable strings" do
      daily = build(:meeting_schedule)
      weekly = build(:meeting_schedule, :weekly_sync, weekly_day: 3)
      monthly = build(:meeting_schedule, :monthly_review, weekly_day: 1, monthly_week: 2)

      expect(daily.cadence_label).to eq("Every weekday")
      expect(weekly.cadence_label).to eq("Every Wednesday")
      expect(monthly.cadence_label).to eq("Second Monday of the month")
    end
  end

  describe "defaults" do
    it "creates baseline schedules for a new user" do
      user = create(:user)

      expect(user.meeting_schedules.count).to eq(MeetingSchedule::MEETING_TYPES.size)
      expect(user.meeting_schedules.pluck(:meeting_type)).to contain_exactly(
        MeetingSchedule::MEETING_TYPES[:daily_standup],
        MeetingSchedule::MEETING_TYPES[:weekly_sync],
        MeetingSchedule::MEETING_TYPES[:monthly_review],
      )
    end
  end
end
