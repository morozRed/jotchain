# frozen_string_literal: true

class Project < ApplicationRecord
  MAX_NAME_LENGTH = 100

  belongs_to :user
  has_many :project_persons, dependent: :destroy
  has_many :persons, through: :project_persons, source: :person
  has_many :entry_mentions, as: :mentionable, dependent: :destroy
  has_many :entries, through: :entry_mentions

  encrypts :name

  validates :name, presence: true, length: {maximum: MAX_NAME_LENGTH}
  validates :color, format: {with: /\A#[0-9A-F]{6}\z/i}, allow_blank: true

  scope :for_user, ->(user) { where(user: user) }
  scope :alphabetical, -> { order(:name) }

  def to_s
    name
  end
end
