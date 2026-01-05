# frozen_string_literal: true

class SignalEntity < ApplicationRecord
  ENTITY_TYPES = %w[project person topic keyword].freeze

  belongs_to :signal, class_name: "WorkSignal", foreign_key: :signal_id
  belongs_to :mentionable, polymorphic: true, optional: true

  validates :entity_type, presence: true, inclusion: { in: ENTITY_TYPES }
  validates :name, presence: true

  scope :projects, -> { where(entity_type: "project") }
  scope :persons, -> { where(entity_type: "person") }
  scope :topics, -> { where(entity_type: "topic") }
  scope :keywords, -> { where(entity_type: "keyword") }
end
