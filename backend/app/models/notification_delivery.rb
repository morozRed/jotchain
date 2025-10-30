# frozen_string_literal: true

class NotificationDelivery < ApplicationRecord
  STATUSES = {
    pending: "pending",
    generating: "generating",
    delivering: "delivering",
    delivered: "delivered",
    skipped: "skipped",
    failed: "failed"
  }.freeze

  belongs_to :notification_schedule
  belongs_to :user

  enum :status, STATUSES, suffix: true

  scope :due, ->(time = Time.current) { where(status: :pending, trigger_at: ..time) }

  validates :occurrence_at, :trigger_at, :window_start, :window_end, presence: true
  validates :status, inclusion: {in: STATUSES.values}

  def ready_to_send?(at: Time.current)
    pending_status? && trigger_at <= at
  end
end
