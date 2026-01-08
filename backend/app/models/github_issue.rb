# frozen_string_literal: true

class GitHubIssue < ApplicationRecord
  belongs_to :github_repository
  belongs_to :author, class_name: "GitHubContributor", optional: true

  validates :github_id, presence: true, uniqueness: { scope: :github_repository_id }
  validates :number, presence: true, uniqueness: { scope: :github_repository_id }
  validates :title, presence: true
  validates :state, presence: true, inclusion: { in: %w[open closed] }
  validates :opened_at, presence: true

  scope :open, -> { where(state: "open") }
  scope :closed, -> { where(state: "closed") }
  scope :in_period, ->(start_date, end_date) { where(opened_at: start_date..end_date) }
  scope :recent, -> { order(opened_at: :desc) }

  delegate :workspace, to: :github_repository

  def github_url
    "#{github_repository.github_url}/issues/#{number}"
  end

  def open?
    state == "open"
  end

  def closed?
    state == "closed"
  end

  # Time to close in hours
  def time_to_close_hours
    return nil unless closed_at

    ((closed_at - opened_at) / 1.hour).round(1)
  end

  def age_hours
    return nil unless open?

    ((Time.current - opened_at) / 1.hour).round(1)
  end

  def label_names
    (labels || []).map { |l| l["name"] }
  end
end
