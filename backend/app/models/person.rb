# frozen_string_literal: true

class Person < ApplicationRecord
  self.table_name = "persons"

  MAX_NAME_LENGTH = 100

  belongs_to :user
  has_many :project_persons, dependent: :destroy
  has_many :projects, through: :project_persons
  has_many :entry_mentions, as: :mentionable, dependent: :destroy
  has_many :entries, through: :entry_mentions
  has_one :contributor_person_link, dependent: :destroy
  has_one :github_contributor, through: :contributor_person_link

  encrypts :name

  validates :name, presence: true, length: {maximum: MAX_NAME_LENGTH}

  scope :for_user, ->(user) { where(user: user) }
  scope :alphabetical, -> { order(:name) }

  def to_s
    name
  end
end
