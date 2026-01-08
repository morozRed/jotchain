# frozen_string_literal: true

module GithubService
  class MetricsCalculator
    PERIOD_DAYS = {
      "rolling_7d" => 7,
      "rolling_14d" => 14,
      "rolling_30d" => 30
    }.freeze

    def initialize(workspace:, period_type: "rolling_7d", repository: nil)
      @workspace = workspace
      @period_type = period_type
      @repository = repository
      @period_end = Date.current
      @period_start = @period_end - period_days.days
    end

    # Compute metrics for all contributors and team aggregate
    def compute_all
      compute_team_metrics
      compute_contributor_metrics
    end

    # Compute team-level aggregate metrics
    def compute_team_metrics
      metrics = {
        team_throughput: merged_prs.count,
        team_cycle_time_median_hours: median_cycle_time,
        team_review_turnaround_median_hours: median_review_turnaround,
        total_commits: commits.count,
        total_additions: commits.sum(:additions),
        total_deletions: commits.sum(:deletions),
        total_reviews: reviews.count,
        open_prs: open_prs.count,
        stale_prs: stale_prs.count,
        active_contributors: active_contributor_ids.count,
        issues_opened: issues_opened.count,
        issues_closed: issues_closed.count,
        throughput_trend: compute_throughput_trend
      }

      save_snapshot(metrics, contributor: nil)
    end

    # Compute metrics for each contributor
    def compute_contributor_metrics
      contributors.find_each do |contributor|
        metrics = compute_metrics_for_contributor(contributor)
        save_snapshot(metrics, contributor: contributor)
      end
    end

    private

    def period_days
      PERIOD_DAYS[@period_type] || 7
    end

    def repositories
      if @repository
        GitHubRepository.where(id: @repository.id)
      else
        @workspace.github_repositories.sync_enabled
      end
    end

    def repository_ids
      @repository_ids ||= repositories.pluck(:id)
    end

    def contributors
      @workspace.github_contributors
    end

    def commits
      GitHubCommit.where(
        github_repository_id: repository_ids,
        committed_at: @period_start..@period_end
      )
    end

    def pull_requests
      GitHubPullRequest.where(
        github_repository_id: repository_ids,
        opened_at: @period_start..@period_end
      )
    end

    def merged_prs
      GitHubPullRequest.where(
        github_repository_id: repository_ids,
        merged_at: @period_start..@period_end
      )
    end

    def open_prs
      GitHubPullRequest.where(
        github_repository_id: repository_ids,
        state: "open"
      )
    end

    def stale_prs
      open_prs.where("opened_at < ?", 7.days.ago)
    end

    def reviews
      GitHubReview.joins(:github_pull_request)
        .where(github_pull_requests: { github_repository_id: repository_ids })
        .where(submitted_at: @period_start..@period_end)
    end

    def issues_opened
      GitHubIssue.where(
        github_repository_id: repository_ids,
        opened_at: @period_start..@period_end
      )
    end

    def issues_closed
      GitHubIssue.where(
        github_repository_id: repository_ids,
        closed_at: @period_start..@period_end
      )
    end

    def active_contributor_ids
      @active_contributor_ids ||= begin
        commit_authors = commits.distinct.pluck(:author_id)
        pr_authors = pull_requests.distinct.pluck(:author_id)
        reviewers = reviews.distinct.pluck(:reviewer_id)
        (commit_authors + pr_authors + reviewers).compact.uniq
      end
    end

    def median_cycle_time
      cycle_times = merged_prs.map(&:cycle_time_hours).compact
      return nil if cycle_times.empty?

      median(cycle_times)
    end

    def median_review_turnaround
      turnarounds = pull_requests.where.not(first_review_at: nil).map(&:review_turnaround_hours).compact
      return nil if turnarounds.empty?

      median(turnarounds)
    end

    def compute_throughput_trend
      # Compare current period to previous period
      previous_start = @period_start - period_days.days
      previous_end = @period_start - 1.day

      previous_throughput = GitHubPullRequest.where(
        github_repository_id: repository_ids,
        merged_at: previous_start..previous_end
      ).count

      current_throughput = merged_prs.count

      return nil if previous_throughput == 0

      change = ((current_throughput - previous_throughput).to_f / previous_throughput * 100).round(1)
      change
    end

    def compute_metrics_for_contributor(contributor)
      contributor_commits = commits.where(author_id: contributor.id)
      contributor_prs = pull_requests.where(author_id: contributor.id)
      contributor_merged = merged_prs.where(author_id: contributor.id)
      contributor_open = open_prs.where(author_id: contributor.id)
      reviews_given = reviews.where(reviewer_id: contributor.id)
      reviews_received = reviews.joins(:github_pull_request)
        .where(github_pull_requests: { author_id: contributor.id })

      cycle_times = contributor_merged.map(&:cycle_time_hours).compact
      review_turnarounds = contributor_prs.where.not(first_review_at: nil).map(&:review_turnaround_hours).compact

      {
        throughput: contributor_merged.count,
        cycle_time_median_hours: cycle_times.any? ? median(cycle_times) : nil,
        review_turnaround_median_hours: review_turnarounds.any? ? median(review_turnarounds) : nil,
        reviews_given: reviews_given.count,
        reviews_received: reviews_received.count,
        review_load_ratio: compute_review_ratio(reviews_given.count, reviews_received.count),
        wip_count: contributor_open.count,
        commits: contributor_commits.count,
        additions: contributor_commits.sum(:additions),
        deletions: contributor_commits.sum(:deletions),
        prs_opened: contributor_prs.count,
        active_repos: contributor_commits.distinct.pluck(:github_repository_id).count
      }
    end

    def compute_review_ratio(given, received)
      return nil if given == 0 && received == 0
      return given.to_f if received == 0

      (given.to_f / received).round(2)
    end

    def median(array)
      return nil if array.empty?

      sorted = array.sort
      mid = sorted.length / 2

      if sorted.length.odd?
        sorted[mid].round(1)
      else
        ((sorted[mid - 1] + sorted[mid]) / 2.0).round(1)
      end
    end

    def save_snapshot(metrics, contributor:)
      snapshot = GitHubMetricSnapshot.for_scope(
        workspace: @workspace,
        period_type: @period_type,
        period_start: @period_start,
        period_end: @period_end,
        contributor: contributor,
        repository: @repository
      )

      snapshot.metrics = metrics
      snapshot.computed_at = Time.current
      snapshot.save!

      snapshot
    end
  end
end
