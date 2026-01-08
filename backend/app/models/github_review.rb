# frozen_string_literal: true

class GitHubReview < ApplicationRecord
  belongs_to :github_pull_request
  belongs_to :reviewer, class_name: "GitHubContributor", optional: true

  validates :github_id, presence: true, uniqueness: { scope: :github_pull_request_id }
  validates :state, presence: true, inclusion: { in: %w[approved changes_requested commented dismissed pending] }
  validates :submitted_at, presence: true

  scope :in_period, ->(start_date, end_date) { where(submitted_at: start_date..end_date) }
  scope :approved, -> { where(state: "approved") }
  scope :changes_requested, -> { where(state: "changes_requested") }
  scope :commented, -> { where(state: "commented") }
  scope :recent, -> { order(submitted_at: :desc) }

  delegate :github_repository, to: :github_pull_request
  delegate :workspace, to: :github_repository

  def github_url
    "#{github_pull_request.github_url}#pullrequestreview-#{github_id}"
  end

  def approved?
    state == "approved"
  end

  def changes_requested?
    state == "changes_requested"
  end

  def commented?
    state == "commented"
  end

  # Response time in hours (PR opened to this review)
  def response_time_hours
    ((submitted_at - github_pull_request.opened_at) / 1.hour).round(1)
  end
end
