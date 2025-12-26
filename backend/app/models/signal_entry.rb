# frozen_string_literal: true

class SignalEntry < ApplicationRecord
  ROLES = %w[trigger evidence reflection].freeze

  belongs_to :signal, class_name: "WorkSignal", foreign_key: :signal_id
  belongs_to :entry

  validates :role, presence: true, inclusion: { in: ROLES }
  validates :entry_id, uniqueness: { scope: :signal_id }

  scope :triggers, -> { where(role: "trigger") }
  scope :evidence, -> { where(role: "evidence") }
  scope :user_reflections, -> { where(role: "reflection") }
  scope :by_score, -> { order(score: :desc) }
end
