# frozen_string_literal: true

module Github
  class SendWeeklySummariesJob < ApplicationJob
    queue_as :default

    def perform
      Workspace.joins(:github_installations)
        .where.not(github_installations: { id: nil })
        .distinct
        .find_each do |workspace|
          send_summaries_for_workspace(workspace)
        end
    end

    private

    def send_summaries_for_workspace(workspace)
      summary = build_summary(workspace)

      workspace.workspace_memberships.includes(:user).each do |membership|
        user = membership.user
        next unless user.active_subscription? || user.trial_active?

        TeamMailer.weekly_summary(
          user: user,
          workspace: workspace,
          summary: summary
        ).deliver_later
      end
    end

    def build_summary(workspace)
      snapshot = GitHubMetricSnapshot
        .where(workspace: workspace, github_contributor_id: nil, period_type: "rolling_7d")
        .order(computed_at: :desc)
        .first

      top_contributors = workspace.github_contributors
        .joins(:contributor_person_links)
        .includes(:github_pull_requests)
        .limit(5)
        .map do |contributor|
          pr_count = contributor.github_pull_requests
            .merged_in_period(7.days.ago, Time.current)
            .count

          {
            name: contributor.display_name,
            throughput: pr_count
          }
        end
        .sort_by { |c| -c[:throughput] }
        .take(5)

      {
        throughput: snapshot&.throughput || 0,
        active_contributors: snapshot&.active_contributors || 0,
        open_prs: snapshot&.open_prs || 0,
        stale_prs: snapshot&.stale_prs || 0,
        cycle_time_median_hours: snapshot&.cycle_time_median_hours,
        top_contributors: top_contributors
      }
    end
  end
end
