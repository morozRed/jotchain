# frozen_string_literal: true

class WorkSignal < ApplicationRecord
  self.table_name = "signals"

  SIGNAL_TYPES = %w[blockers time_sinks recurring_issues impact wins learnings].freeze
  STATUSES = %w[active ignored acknowledged resolved].freeze
  SOURCES = %w[ai rules].freeze

  # Minimum entries required before surfacing a signal
  SURFACE_THRESHOLD = 3
  # Minimum confidence score to display
  CONFIDENCE_THRESHOLD = 60

  belongs_to :user
  has_many :signal_entries, foreign_key: :signal_id, dependent: :destroy
  has_many :entries, through: :signal_entries
  has_many :signal_entities, foreign_key: :signal_id, dependent: :destroy

  validates :signal_type, presence: true, inclusion: { in: SIGNAL_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :source, presence: true, inclusion: { in: SOURCES }
  validates :entity_name, presence: true
  validates :title, presence: true
  validates :first_detected_at, :last_detected_at, presence: true
  validates :confidence, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }

  scope :active, -> { where(status: "active") }
  scope :surfaceable, lambda {
    active
      .where("confidence >= ?", CONFIDENCE_THRESHOLD)
      .where(
        id: SignalEntry.select(:signal_id)
                       .group(:signal_id)
                       .having("COUNT(*) >= ?", SURFACE_THRESHOLD)
      )
  }
  scope :unseen, -> { where(seen_at: nil) }
  scope :by_type, ->(type) { where(signal_type: type) }
  scope :recent_first, -> { order(last_detected_at: :desc) }
  scope :negative, -> { where(signal_type: %w[blockers time_sinks recurring_issues]) }
  scope :positive, -> { where(signal_type: %w[impact wins learnings]) }

  def seen!
    update!(seen_at: Time.current) if seen_at.nil?
  end

  def ignore!
    update!(status: "ignored")
  end

  def acknowledge!
    update!(status: "acknowledged")
  end

  def resolve!
    update!(status: "resolved")
  end

  def entry_count
    signal_entries.size
  end

  def surfaceable?
    active? && confidence >= CONFIDENCE_THRESHOLD && entry_count >= SURFACE_THRESHOLD
  end

  def active?
    status == "active"
  end

  def negative?
    %w[blockers time_sinks recurring_issues].include?(signal_type)
  end

  def positive?
    %w[impact wins learnings].include?(signal_type)
  end
end
