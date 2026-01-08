# frozen_string_literal: true

class GitHubCommit < ApplicationRecord
  belongs_to :github_repository
  belongs_to :author, class_name: "GitHubContributor", optional: true

  validates :sha, presence: true, uniqueness: { scope: :github_repository_id }
  validates :committed_at, presence: true

  scope :in_period, ->(start_date, end_date) { where(committed_at: start_date..end_date) }
  scope :by_author, ->(contributor_id) { where(author_id: contributor_id) }
  scope :recent, -> { order(committed_at: :desc) }

  delegate :workspace, to: :github_repository

  def github_url
    "#{github_repository.github_url}/commit/#{sha}"
  end

  def short_sha
    sha[0..6]
  end

  def lines_changed
    additions + deletions
  end

  def message_subject
    message&.split("\n")&.first
  end
end
