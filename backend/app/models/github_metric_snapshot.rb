# frozen_string_literal: true

class GitHubMetricSnapshot < ApplicationRecord
  belongs_to :workspace
  belongs_to :github_contributor, optional: true
  belongs_to :github_repository, optional: true

  PERIOD_TYPES = %w[rolling_7d rolling_14d rolling_30d weekly].freeze

  validates :period_type, presence: true, inclusion: { in: PERIOD_TYPES }
  validates :period_start, presence: true
  validates :period_end, presence: true
  validates :computed_at, presence: true

  scope :team_aggregate, -> { where(github_contributor_id: nil) }
  scope :per_contributor, -> { where.not(github_contributor_id: nil) }
  scope :all_repos, -> { where(github_repository_id: nil) }
  scope :per_repo, -> { where.not(github_repository_id: nil) }
  scope :rolling, -> { where(period_type: %w[rolling_7d rolling_14d rolling_30d]) }
  scope :weekly, -> { where(period_type: "weekly") }
  scope :latest, -> { order(computed_at: :desc) }

  # Find or create a snapshot for the given scope
  def self.for_scope(workspace:, period_type:, period_start:, period_end:, contributor: nil, repository: nil)
    find_or_initialize_by(
      workspace: workspace,
      github_contributor: contributor,
      github_repository: repository,
      period_type: period_type,
      period_start: period_start
    ).tap do |snapshot|
      snapshot.period_end = period_end
    end
  end

  # Metric accessors with defaults
  def throughput
    metrics["throughput"] || 0
  end

  def cycle_time_median_hours
    metrics["cycle_time_median_hours"]
  end

  def review_turnaround_median_hours
    metrics["review_turnaround_median_hours"]
  end

  def reviews_given
    metrics["reviews_given"] || 0
  end

  def reviews_received
    metrics["reviews_received"] || 0
  end

  def review_load_ratio
    metrics["review_load_ratio"]
  end

  def wip_count
    metrics["wip_count"] || 0
  end

  def commits
    metrics["commits"] || 0
  end

  def additions
    metrics["additions"] || 0
  end

  def deletions
    metrics["deletions"] || 0
  end

  def open_prs
    metrics["open_prs"] || 0
  end

  def stale_prs
    metrics["stale_prs"] || 0
  end

  def active_contributors
    metrics["active_contributors"] || 0
  end

  def issues_opened
    metrics["issues_opened"] || 0
  end

  def issues_closed
    metrics["issues_closed"] || 0
  end

  # Team vs contributor check
  def team_aggregate?
    github_contributor_id.nil?
  end

  def contributor_specific?
    github_contributor_id.present?
  end

  # Period helpers
  def rolling_7d?
    period_type == "rolling_7d"
  end

  def rolling_14d?
    period_type == "rolling_14d"
  end

  def rolling_30d?
    period_type == "rolling_30d"
  end

  def weekly?
    period_type == "weekly"
  end
end
