# frozen_string_literal: true

class RepositoriesController < InertiaController
  def index
    render inertia: "repositories/index", props: {
      workspace: workspace_props,
      repositories: repositories_with_metrics
    }
  end

  def show
    track_event(MetricEvent::REPOSITORY_VIEW, { repository_id: params[:id] })
    repository = Current.workspace.github_repositories.find(params[:id])

    render inertia: "repositories/show", props: {
      workspace: workspace_props,
      repository: repository_detail_props(repository),
      metrics: repository_metrics(repository),
      openPrs: repository_open_prs(repository),
      recentCommits: repository_recent_commits(repository),
      contributors: repository_contributors(repository)
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

  def repositories_with_metrics
    Current.workspace.github_repositories.sync_enabled.map do |repo|
      pr_count = repo.github_pull_requests.where(state: "open").count
      merged_7d = repo.github_pull_requests.merged_in_period(7.days.ago, Time.current).count
      commit_count_7d = repo.github_commits.in_period(7.days.ago, Time.current).count

      {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        githubUrl: repo.github_url,
        private: repo.private,
        openPrCount: pr_count,
        mergedPrs7d: merged_7d,
        commits7d: commit_count_7d,
        lastSyncedAt: repo.last_synced_at&.iso8601
      }
    end.sort_by { |r| -r[:mergedPrs7d] }
  end

  def repository_detail_props(repository)
    {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      githubUrl: repository.github_url,
      private: repository.private,
      defaultBranch: repository.default_branch,
      lastSyncedAt: repository.last_synced_at&.iso8601
    }
  end

  def repository_metrics(repository)
    period_start = 7.days.ago
    period_end = Time.current

    merged_prs = repository.github_pull_requests.merged_in_period(period_start, period_end)
    open_prs = repository.github_pull_requests.where(state: "open")
    commits = repository.github_commits.in_period(period_start, period_end)

    cycle_times = merged_prs.map(&:cycle_time_hours).compact
    review_turnarounds = merged_prs.map(&:review_turnaround_hours).compact

    {
      throughput: merged_prs.count,
      cycleTimeMedianHours: cycle_times.any? ? median(cycle_times) : nil,
      reviewTurnaroundMedianHours: review_turnarounds.any? ? median(review_turnarounds) : nil,
      openPrs: open_prs.count,
      stalePrs: open_prs.count(&:stale?),
      totalCommits: commits.count,
      additions: commits.sum(:additions),
      deletions: commits.sum(:deletions),
      periodStart: period_start.to_date.iso8601,
      periodEnd: period_end.to_date.iso8601
    }
  end

  def repository_open_prs(repository)
    repository.github_pull_requests.where(state: "open")
      .includes(:author, :github_reviews)
      .order(opened_at: :desc)
      .limit(20)
      .map do |pr|
        {
          id: pr.id,
          number: pr.number,
          title: pr.title,
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

  def repository_recent_commits(repository)
    repository.github_commits
      .where("committed_at > ?", 14.days.ago)
      .includes(:author)
      .order(committed_at: :desc)
      .limit(20)
      .map do |commit|
        {
          sha: commit.short_sha,
          message: commit.message_subject,
          author: commit.author&.login,
          authorAvatar: commit.author&.avatar_url_with_fallback,
          committedAt: commit.committed_at.iso8601,
          additions: commit.additions,
          deletions: commit.deletions,
          url: commit.github_url
        }
      end
  end

  def repository_contributors(repository)
    contributor_ids = repository.github_commits
      .where("committed_at > ?", 7.days.ago)
      .where.not(author_id: nil)
      .distinct
      .pluck(:author_id)

    Current.workspace.github_contributors
      .where(id: contributor_ids)
      .map do |contributor|
        commits = repository.github_commits.where(author: contributor).in_period(7.days.ago, Time.current)
        prs = repository.github_pull_requests.where(author: contributor).merged_in_period(7.days.ago, Time.current)

        {
          id: contributor.id,
          login: contributor.login,
          name: contributor.name,
          avatarUrl: contributor.avatar_url_with_fallback,
          commits: commits.count,
          prsMerged: prs.count
        }
      end
      .sort_by { |c| -(c[:commits] + c[:prsMerged] * 3) }
  end

  def median(array)
    return nil if array.empty?

    sorted = array.sort
    mid = sorted.length / 2
    sorted.length.odd? ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2.0
  end

  def track_event(event_type, metadata = {})
    MetricEvent.track(
      event_type: event_type,
      user: Current.user,
      workspace: Current.workspace,
      metadata: metadata
    )
  rescue => e
    Rails.logger.error("Failed to track event: #{e.message}")
  end
end
