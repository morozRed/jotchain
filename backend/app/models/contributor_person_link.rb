# frozen_string_literal: true

class ContributorPersonLink < ApplicationRecord
  belongs_to :user
  belongs_to :github_contributor
  belongs_to :person

  validates :github_contributor_id, uniqueness: { scope: :user_id, message: "is already linked to a person" }
  validates :person, presence: true

  scope :for_user, ->(user) { where(user: user) }
end
