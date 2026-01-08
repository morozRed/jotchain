# frozen_string_literal: true

class MetricEvent < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :workspace, optional: true

  validates :event_type, presence: true

  scope :for_workspace, ->(workspace) { where(workspace: workspace) }
  scope :for_user, ->(user) { where(user: user) }
  scope :of_type, ->(type) { where(event_type: type) }
  scope :in_period, ->(start_time, end_time) { where(created_at: start_time..end_time) }

  # Event types
  DASHBOARD_VIEW = "team_dashboard_view"
  CONTRIBUTOR_VIEW = "contributor_profile_view"
  REPOSITORY_VIEW = "repository_view"
  INTEGRATION_VIEW = "integrations_settings_view"

  def self.track(event_type:, user: nil, workspace: nil, metadata: {})
    create(
      event_type: event_type,
      user: user,
      workspace: workspace,
      metadata: metadata
    )
  end

  def self.daily_counts(event_type, workspace:, days: 30)
    for_workspace(workspace)
      .of_type(event_type)
      .where("created_at > ?", days.days.ago)
      .group("DATE(created_at)")
      .count
  end
end
