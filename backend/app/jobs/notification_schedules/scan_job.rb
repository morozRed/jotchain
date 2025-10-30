# frozen_string_literal: true

module NotificationSchedules
  class ScanJob < ApplicationJob
    queue_as :default

    SCAN_HORIZON_HOURS = ENV.fetch("SUMMARY_SCAN_HORIZON_HOURS", 24).to_i
    MAX_OCCURRENCES_PER_SCHEDULE = 3

    def perform(now: Time.current)
      now = now.in_time_zone("UTC")
      horizon = now + SCAN_HORIZON_HOURS.hours

      NotificationSchedule.enabled.includes(:user).find_each do |schedule|
        occurrences_for(schedule, from: now, to: horizon).each do |occurrence|
          create_or_update_delivery(schedule, occurrence)
        end
      end
    end

    private

    def occurrences_for(schedule, from:, to:)
      occurrences = []
      cursor = from

      MAX_OCCURRENCES_PER_SCHEDULE.times do
        occurrence = schedule.next_occurrence(from: cursor)
        break if occurrence > to

        occurrences << occurrence
        cursor = occurrence + 1.second
      end

      occurrences
    end

    def create_or_update_delivery(schedule, occurrence)
      window = schedule.summary_window(occurrence_at: occurrence)
      trigger_at = occurrence - schedule.lead_time_duration

      delivery = NotificationDelivery.find_or_initialize_by(notification_schedule: schedule, occurrence_at: occurrence)
      delivery.user = schedule.user
      delivery.trigger_at = trigger_at
      delivery.window_start = window[:start]
      delivery.window_end = window[:end]
      delivery.status = :pending if delivery.new_record?

      delivery.save!

      if delivery.previous_changes.key?("id") || delivery.previous_changes.key?("trigger_at")
        enqueue_delivery(delivery)
      elsif delivery.pending_status? && delivery.trigger_at <= Time.current
        enqueue_delivery(delivery)
      end
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.warn(
        message: "Failed to schedule notification delivery",
        schedule_id: schedule.id,
        occurrence: occurrence,
        error: e.message
      )
    end

    def enqueue_delivery(delivery)
      Notifications::SendSummaryJob
        .set(wait_until: delivery.trigger_at)
        .perform_later(delivery.id)
    end
  end
end
