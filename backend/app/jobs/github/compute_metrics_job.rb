# frozen_string_literal: true

module Github
  class ComputeMetricsJob < ApplicationJob
    queue_as :default

    # Run for all workspaces with GitHub installations
    def perform(workspace_id = nil, period_type: "rolling_7d")
      if workspace_id
        compute_for_workspace(workspace_id, period_type)
      else
        compute_for_all_workspaces(period_type)
      end
    end

    private

    def compute_for_workspace(workspace_id, period_type)
      workspace = Workspace.find_by(id: workspace_id)
      return unless workspace
      return unless workspace.github_installations.exists?

      Rails.logger.info("Computing #{period_type} metrics for workspace #{workspace.id}")

      calculator = GithubService::MetricsCalculator.new(
        workspace: workspace,
        period_type: period_type
      )
      calculator.compute_all

      Rails.logger.info("Completed metrics computation for workspace #{workspace.id}")
    end

    def compute_for_all_workspaces(period_type)
      Workspace.joins(:github_installations).distinct.find_each do |workspace|
        ComputeMetricsJob.perform_later(workspace.id, period_type: period_type)
      end
    end
  end
end
