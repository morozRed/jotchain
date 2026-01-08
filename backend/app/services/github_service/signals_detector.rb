# frozen_string_literal: true

module GithubService
  class SignalsDetector
    # Thresholds (could be configurable per workspace)
    STALE_PR_WARNING_DAYS = 3
    STALE_PR_CRITICAL_DAYS = 7
    REVIEW_BOTTLENECK_HOURS = 48
    THROUGHPUT_DROP_THRESHOLD = 0.30
    REVIEW_LOAD_HIGH_RATIO = 2.0
    REVIEW_LOAD_LOW_RATIO = 0.5
    WIP_ELEVATED_COUNT = 3
    WIP_HIGH_COUNT = 5

    Signal = Struct.new(
      :type,
      :severity,
      :title,
      :description,
      :entity_type,
      :entity_id,
      :metadata,
      keyword_init: true
    )

    def initialize(workspace:)
      @workspace = workspace
      @signals = []
    end

    def detect_all
      detect_stale_prs
      detect_review_bottlenecks
      detect_uneven_review_load
      detect_throughput_drops
      detect_high_wip
      @signals
    end

    private

    def repositories
      @repositories ||= @workspace.github_repositories.sync_enabled
    end

    def repository_ids
      @repository_ids ||= repositories.pluck(:id)
    end

    def open_prs
      @open_prs ||= GitHubPullRequest.where(
        github_repository_id: repository_ids,
        state: "open"
      )
    end

    # Stale PRs - no activity for a period
    def detect_stale_prs
      open_prs.find_each do |pr|
        last_activity = [
          pr.opened_at,
          pr.github_reviews.maximum(:submitted_at)
        ].compact.max

        days_stale = (Date.current - last_activity.to_date).to_i

        if days_stale >= STALE_PR_CRITICAL_DAYS
          @signals << Signal.new(
            type: "stale_pr",
            severity: "critical",
            title: "PR ##{pr.number} has no activity for #{days_stale} days",
            description: "\"#{pr.title}\" in #{pr.github_repository.full_name} hasn't had any activity since #{last_activity.to_date}",
            entity_type: "GitHubPullRequest",
            entity_id: pr.id,
            metadata: {
              pr_number: pr.number,
              repository: pr.github_repository.full_name,
              days_stale: days_stale,
              author: pr.author&.login
            }
          )
        elsif days_stale >= STALE_PR_WARNING_DAYS
          @signals << Signal.new(
            type: "stale_pr",
            severity: "warning",
            title: "PR ##{pr.number} needs attention",
            description: "\"#{pr.title}\" hasn't had activity for #{days_stale} days",
            entity_type: "GitHubPullRequest",
            entity_id: pr.id,
            metadata: {
              pr_number: pr.number,
              repository: pr.github_repository.full_name,
              days_stale: days_stale,
              author: pr.author&.login
            }
          )
        end
      end
    end

    # PRs waiting for review beyond threshold
    def detect_review_bottlenecks
      open_prs.where(first_review_at: nil).find_each do |pr|
        hours_waiting = ((Time.current - pr.opened_at) / 1.hour).round(1)

        if hours_waiting >= REVIEW_BOTTLENECK_HOURS
          @signals << Signal.new(
            type: "review_bottleneck",
            severity: hours_waiting >= 72 ? "critical" : "warning",
            title: "PR ##{pr.number} waiting #{hours_waiting.round}h for review",
            description: "\"#{pr.title}\" has been waiting for its first review for #{hours_waiting.round} hours",
            entity_type: "GitHubPullRequest",
            entity_id: pr.id,
            metadata: {
              pr_number: pr.number,
              repository: pr.github_repository.full_name,
              hours_waiting: hours_waiting,
              author: pr.author&.login
            }
          )
        end
      end
    end

    # Uneven distribution of review work
    def detect_uneven_review_load
      period_start = 14.days.ago

      review_counts = GitHubReview.joins(:github_pull_request)
        .where(github_pull_requests: { github_repository_id: repository_ids })
        .where("github_reviews.submitted_at >= ?", period_start)
        .group(:reviewer_id)
        .count

      return if review_counts.empty?

      total_reviews = review_counts.values.sum
      reviewer_count = review_counts.size

      review_counts.each do |reviewer_id, count|
        next unless reviewer_id

        share = count.to_f / total_reviews
        reviewer = GitHubContributor.find_by(id: reviewer_id)
        next unless reviewer

        # Single reviewer doing >50% of reviews
        if share > 0.5 && reviewer_count > 2
          @signals << Signal.new(
            type: "uneven_review_load",
            severity: "warning",
            title: "#{reviewer.display_name} is handling #{(share * 100).round}% of reviews",
            description: "Consider distributing review load more evenly across the team",
            entity_type: "GitHubContributor",
            entity_id: reviewer_id,
            metadata: {
              reviewer_login: reviewer.login,
              reviews_given: count,
              total_reviews: total_reviews,
              share_percentage: (share * 100).round(1)
            }
          )
        end
      end

      # Check for contributors with high review load ratio
      @workspace.github_contributors.find_each do |contributor|
        snapshot = GitHubMetricSnapshot
          .where(workspace: @workspace, github_contributor: contributor, period_type: "rolling_14d")
          .order(computed_at: :desc)
          .first

        next unless snapshot&.review_load_ratio

        if snapshot.review_load_ratio >= REVIEW_LOAD_HIGH_RATIO
          @signals << Signal.new(
            type: "high_review_load",
            severity: "info",
            title: "#{contributor.display_name} has high review load",
            description: "Review load ratio: #{snapshot.review_load_ratio} (giving #{snapshot.reviews_given}, receiving #{snapshot.reviews_received})",
            entity_type: "GitHubContributor",
            entity_id: contributor.id,
            metadata: {
              contributor_login: contributor.login,
              review_load_ratio: snapshot.review_load_ratio,
              reviews_given: snapshot.reviews_given,
              reviews_received: snapshot.reviews_received
            }
          )
        end
      end
    end

    # Significant drop in throughput
    def detect_throughput_drops
      # Get latest team snapshot
      snapshot = GitHubMetricSnapshot
        .where(workspace: @workspace, github_contributor_id: nil, period_type: "rolling_7d")
        .order(computed_at: :desc)
        .first

      return unless snapshot

      trend = snapshot.metrics["throughput_trend"]
      return unless trend

      if trend <= -THROUGHPUT_DROP_THRESHOLD * 100
        @signals << Signal.new(
          type: "throughput_drop",
          severity: "warning",
          title: "Team throughput dropped #{trend.abs.round}%",
          description: "Merged PRs decreased from previous period. Current: #{snapshot.throughput} PRs",
          entity_type: "Workspace",
          entity_id: @workspace.id,
          metadata: {
            throughput: snapshot.throughput,
            trend_percentage: trend
          }
        )
      end
    end

    # Contributors with high work in progress
    def detect_high_wip
      @workspace.github_contributors.find_each do |contributor|
        wip_count = open_prs.where(author_id: contributor.id).count

        if wip_count >= WIP_HIGH_COUNT
          @signals << Signal.new(
            type: "high_wip",
            severity: "warning",
            title: "#{contributor.display_name} has #{wip_count} open PRs",
            description: "High WIP count may indicate blocked work or context-switching",
            entity_type: "GitHubContributor",
            entity_id: contributor.id,
            metadata: {
              contributor_login: contributor.login,
              wip_count: wip_count
            }
          )
        elsif wip_count >= WIP_ELEVATED_COUNT
          @signals << Signal.new(
            type: "elevated_wip",
            severity: "info",
            title: "#{contributor.display_name} has #{wip_count} PRs in flight",
            description: "Multiple PRs open simultaneously",
            entity_type: "GitHubContributor",
            entity_id: contributor.id,
            metadata: {
              contributor_login: contributor.login,
              wip_count: wip_count
            }
          )
        end
      end
    end
  end
end
