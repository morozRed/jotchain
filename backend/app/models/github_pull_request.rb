# frozen_string_literal: true

class GitHubPullRequest < ApplicationRecord
  belongs_to :github_repository
  belongs_to :author, class_name: "GitHubContributor", optional: true
  has_many :github_reviews, dependent: :destroy

  validates :github_id, presence: true, uniqueness: { scope: :github_repository_id }
  validates :number, presence: true, uniqueness: { scope: :github_repository_id }
  validates :title, presence: true
  validates :state, presence: true, inclusion: { in: %w[open closed merged] }
  validates :opened_at, presence: true

  scope :open, -> { where(state: "open") }
  scope :closed, -> { where(state: "closed") }
  scope :merged, -> { where(state: "merged") }
  scope :in_period, ->(start_date, end_date) { where(opened_at: start_date..end_date) }
  scope :merged_in_period, ->(start_date, end_date) { merged.where(merged_at: start_date..end_date) }
  scope :recent, -> { order(opened_at: :desc) }

  delegate :workspace, to: :github_repository

  def github_url
    "#{github_repository.github_url}/pull/#{number}"
  end

  def open?
    state == "open"
  end

  def merged?
    state == "merged"
  end

  def closed?
    state == "closed"
  end

  def lines_changed
    additions + deletions
  end

  # Cycle time in hours (opened to merged)
  def cycle_time_hours
    return nil unless merged_at

    ((merged_at - opened_at) / 1.hour).round(1)
  end

  # Review turnaround in hours (opened to first review)
  def review_turnaround_hours
    return nil unless first_review_at

    ((first_review_at - opened_at) / 1.hour).round(1)
  end

  # Age in hours (for open PRs)
  def age_hours
    return nil unless open?

    ((Time.current - opened_at) / 1.hour).round(1)
  end

  def stale?(threshold_days: 7)
    return false unless open?

    last_activity = [opened_at, github_reviews.maximum(:submitted_at)].compact.max
    last_activity < threshold_days.days.ago
  end
end
