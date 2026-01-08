# frozen_string_literal: true

module Github
  class WeeklySnapshotJob < ApplicationJob
    queue_as :default

    def perform(workspace_id = nil)
      if workspace_id
        create_weekly_snapshot(workspace_id)
      else
        create_all_weekly_snapshots
      end
    end

    private

    def create_weekly_snapshot(workspace_id)
      workspace = Workspace.find_by(id: workspace_id)
      return unless workspace
      return unless workspace.github_installations.exists?

      Rails.logger.info("Creating weekly snapshot for workspace #{workspace.id}")

      # Use rolling_7d data as the weekly snapshot
      calculator = GithubService::MetricsCalculator.new(
        workspace: workspace,
        period_type: "weekly"
      )
      calculator.compute_all

      Rails.logger.info("Completed weekly snapshot for workspace #{workspace.id}")
    end

    def create_all_weekly_snapshots
      Workspace.joins(:github_installations).distinct.find_each do |workspace|
        WeeklySnapshotJob.perform_later(workspace.id)
      end
    end
  end
end
