# frozen_string_literal: true

class InsightRequest < ApplicationRecord
  QUERY_TYPES = %w[summary tweets review blog update ideas custom].freeze
  STATUSES = %w[pending generating completed failed].freeze

  belongs_to :user

  validates :name, :query_type, :date_range_start, :date_range_end, :status, presence: true
  validates :query_type, inclusion: {in: QUERY_TYPES}
  validates :status, inclusion: {in: STATUSES}
  validates :custom_query, presence: true, if: -> { query_type == "custom" }
  validate :date_range_end_after_start

  scope :recent_first, -> { order(created_at: :desc) }
  scope :completed, -> { where(status: "completed") }
  scope :for_period, ->(range) { where(created_at: range) }
  scope :visible, -> { where(deleted_at: nil) }

  def generating?
    status == "generating"
  end

  def completed?
    status == "completed"
  end

  def failed?
    status == "failed"
  end

  def deleted?
    deleted_at.present?
  end

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  private

  def date_range_end_after_start
    return unless date_range_start && date_range_end

    if date_range_end <= date_range_start
      errors.add(:date_range_end, "must be after start date")
    end
  end
end
