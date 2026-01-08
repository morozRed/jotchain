# frozen_string_literal: true

class GitHubContributor < ApplicationRecord
  belongs_to :workspace
  has_many :github_commits, foreign_key: :author_id, dependent: :nullify
  has_many :github_pull_requests, foreign_key: :author_id, dependent: :nullify
  has_many :github_reviews, foreign_key: :reviewer_id, dependent: :nullify
  has_many :github_issues, foreign_key: :author_id, dependent: :nullify

  validates :github_id, presence: true, uniqueness: { scope: :workspace_id }
  validates :login, presence: true

  scope :active_in_period, ->(start_date, end_date) {
    joins(:github_commits)
      .where(github_commits: { committed_at: start_date..end_date })
      .distinct
  }

  def display_name
    name.presence || login
  end

  def avatar_url_with_fallback
    avatar_url.presence || "https://github.com/#{login}.png"
  end

  def github_profile_url
    "https://github.com/#{login}"
  end

  # Activity stats
  def commits_in_period(start_date, end_date)
    github_commits.where(committed_at: start_date..end_date)
  end

  def prs_in_period(start_date, end_date)
    github_pull_requests.where(opened_at: start_date..end_date)
  end

  def reviews_in_period(start_date, end_date)
    github_reviews.where(submitted_at: start_date..end_date)
  end
end
