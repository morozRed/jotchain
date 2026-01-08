# frozen_string_literal: true

class TeamController < InertiaController
  def index
    render inertia: "team/index", props: {
      workspace: workspace_props,
      metrics: team_metrics,
      contributors: contributors_with_metrics,
      openPrs: open_prs_props,
      signals: team_signals,
      recentActivity: recent_activity
    }
  end

  def contributor
    contributor = Current.workspace.github_contributors.find(params[:id])

    render inertia: "team/contributor", props: {
      workspace: workspace_props,
      contributor: contributor_detail_props(contributor),
      metrics: contributor_metrics(contributor),
      openPrs: contributor_open_prs(contributor),
      recentCommits: contributor_recent_commits(contributor),
      reviewActivity: contributor_review_activity(contributor)
    }
  end

  private

  def workspace_props
    {
      id: Current.workspace.id,
      name: Current.workspace.name,
      slug: Current.workspace.slug
    }
  end

  def team_metrics
    snapshot = GitHubMetricSnapshot
      .where(workspace: Current.workspace, github_contributor_id: nil, period_type: "rolling_7d")
      .order(computed_at: :desc)
      .first

    return default_team_metrics unless snapshot

    {
      throughput: snapshot.throughput,
      cycleTimeMedianHours: snapshot.cycle_time_median_hours,
      reviewTurnaroundMedianHours: snapshot.review_turnaround_median_hours,
      openPrs: snapshot.open_prs,
      stalePrs: snapshot.stale_prs,
      activeContributors: snapshot.active_contributors,
      totalCommits: snapshot.metrics["total_commits"] || 0,
      throughputTrend: snapshot.metrics["throughput_trend"],
      periodStart: snapshot.period_start.iso8601,
      periodEnd: snapshot.period_end.iso8601,
      computedAt: snapshot.computed_at.iso8601
    }
  end

  def default_team_metrics
    {
      throughput: 0,
      cycleTimeMedianHours: nil,
      reviewTurnaroundMedianHours: nil,
      openPrs: 0,
      stalePrs: 0,
      activeContributors: 0,
      totalCommits: 0,
      throughputTrend: nil,
      periodStart: 7.days.ago.to_date.iso8601,
      periodEnd: Date.current.iso8601,
      computedAt: nil
    }
  end

  def contributors_with_metrics
    Current.workspace.github_contributors.includes(:github_commits, :github_pull_requests).map do |contributor|
      snapshot = GitHubMetricSnapshot
        .where(workspace: Current.workspace, github_contributor: contributor, period_type: "rolling_7d")
        .order(computed_at: :desc)
        .first

      {
        id: contributor.id,
        login: contributor.login,
        name: contributor.name,
        avatarUrl: contributor.avatar_url_with_fallback,
        throughput: snapshot&.throughput || 0,
        commits: snapshot&.commits || 0,
        reviewsGiven: snapshot&.reviews_given || 0,
        wipCount: snapshot&.wip_count || 0,
        cycleTimeMedianHours: snapshot&.cycle_time_median_hours
      }
    end.sort_by { |c| -c[:throughput] }
  end

  def open_prs_props
    repository_ids = Current.workspace.github_repositories.sync_enabled.pluck(:id)

    GitHubPullRequest.where(github_repository_id: repository_ids, state: "open")
      .includes(:author, :github_repository, :github_reviews)
      .order(opened_at: :desc)
      .limit(20)
      .map do |pr|
        {
          id: pr.id,
          number: pr.number,
          title: pr.title,
          repository: pr.github_repository.full_name,
          author: pr.author&.login,
          authorAvatar: pr.author&.avatar_url_with_fallback,
          openedAt: pr.opened_at.iso8601,
          ageHours: pr.age_hours,
          reviewCount: pr.github_reviews.count,
          stale: pr.stale?,
          draft: pr.draft,
          url: pr.github_url
        }
      end
  end

  def team_signals
    detector = GithubService::SignalsDetector.new(workspace: Current.workspace)
    signals = detector.detect_all

    signals.map do |signal|
      {
        type: signal.type,
        severity: signal.severity,
        title: signal.title,
        description: signal.description,
        entityType: signal.entity_type,
        entityId: signal.entity_id,
        metadata: signal.metadata
      }
    end.sort_by { |s| s[:severity] == "critical" ? 0 : (s[:severity] == "warning" ? 1 : 2) }
  end

  def recent_activity
    repository_ids = Current.workspace.github_repositories.sync_enabled.pluck(:id)

    # Recent merged PRs
    recent_merged = GitHubPullRequest.where(github_repository_id: repository_ids, state: "merged")
      .where("merged_at > ?", 7.days.ago)
      .includes(:author, :github_repository)
      .order(merged_at: :desc)
      .limit(10)
      .map do |pr|
        {
          type: "pr_merged",
          timestamp: pr.merged_at.iso8601,
          title: pr.title,
          repository: pr.github_repository.full_name,
          author: pr.author&.login,
          url: pr.github_url
        }
      end

    recent_merged
  end

  # Contributor detail helpers

  def contributor_detail_props(contributor)
    {
      id: contributor.id,
      login: contributor.login,
      name: contributor.name,
      avatarUrl: contributor.avatar_url_with_fallback,
      githubUrl: contributor.github_profile_url
    }
  end

  def contributor_metrics(contributor)
    periods = %w[rolling_7d rolling_14d rolling_30d]

    periods.map do |period|
      snapshot = GitHubMetricSnapshot
        .where(workspace: Current.workspace, github_contributor: contributor, period_type: period)
        .order(computed_at: :desc)
        .first

      next { period: period, throughput: 0, commits: 0 } unless snapshot

      {
        period: period,
        throughput: snapshot.throughput,
        cycleTimeMedianHours: snapshot.cycle_time_median_hours,
        reviewTurnaroundMedianHours: snapshot.review_turnaround_median_hours,
        reviewsGiven: snapshot.reviews_given,
        reviewsReceived: snapshot.reviews_received,
        reviewLoadRatio: snapshot.review_load_ratio,
        wipCount: snapshot.wip_count,
        commits: snapshot.commits,
        additions: snapshot.additions,
        deletions: snapshot.deletions
      }
    end
  end

  def contributor_open_prs(contributor)
    contributor.github_pull_requests.where(state: "open")
      .includes(:github_repository, :github_reviews)
      .order(opened_at: :desc)
      .map do |pr|
        {
          id: pr.id,
          number: pr.number,
          title: pr.title,
          repository: pr.github_repository.full_name,
          openedAt: pr.opened_at.iso8601,
          ageHours: pr.age_hours,
          reviewCount: pr.github_reviews.count,
          stale: pr.stale?,
          url: pr.github_url
        }
      end
  end

  def contributor_recent_commits(contributor)
    contributor.github_commits
      .where("committed_at > ?", 14.days.ago)
      .includes(:github_repository)
      .order(committed_at: :desc)
      .limit(20)
      .map do |commit|
        {
          sha: commit.short_sha,
          message: commit.message_subject,
          repository: commit.github_repository.full_name,
          committedAt: commit.committed_at.iso8601,
          additions: commit.additions,
          deletions: commit.deletions,
          url: commit.github_url
        }
      end
  end

  def contributor_review_activity(contributor)
    contributor.github_reviews
      .where("submitted_at > ?", 14.days.ago)
      .includes(github_pull_request: [:github_repository, :author])
      .order(submitted_at: :desc)
      .limit(20)
      .map do |review|
        {
          id: review.id,
          state: review.state,
          prNumber: review.github_pull_request.number,
          prTitle: review.github_pull_request.title,
          prAuthor: review.github_pull_request.author&.login,
          repository: review.github_repository.full_name,
          submittedAt: review.submitted_at.iso8601,
          url: review.github_url
        }
      end
  end
end
