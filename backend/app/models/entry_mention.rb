# frozen_string_literal: true

class EntryMention < ApplicationRecord
  belongs_to :entry
  belongs_to :mentionable, polymorphic: true

  validates :entry_id, uniqueness: {scope: [:mentionable_type, :mentionable_id]}

  scope :projects, -> { where(mentionable_type: "Project") }
  scope :persons, -> { where(mentionable_type: "Person") }
end
