# frozen_string_literal: true

module Github
  class SyncRepositoryDataJob < ApplicationJob
    queue_as :default

    # Limit concurrent syncs per installation to avoid rate limits
    limits_concurrency to: 2, key: ->(installation_id, _repo_id) { "github_sync_#{installation_id}" }

    def perform(installation_id, repository_id)
      @installation = GitHubInstallation.find_by(id: installation_id)
      return unless @installation

      @repository = @installation.github_repositories.find_by(id: repository_id)
      return unless @repository&.sync_enabled?

      @client = GithubService::Client.new(installation: @installation)
      @workspace = @installation.workspace

      sync_contributors
      sync_commits
      sync_pull_requests
      sync_issues

      @repository.mark_synced!
      Rails.logger.info("Completed sync for #{@repository.full_name}")
    rescue GithubService::Client::RateLimitError => e
      Rails.logger.warn("Rate limited during sync of #{@repository&.full_name}: #{e.message}")
      # Retry later when rate limit resets
      self.class.set(wait: 5.minutes).perform_later(installation_id, repository_id)
    rescue => e
      Rails.logger.error("Sync failed for #{@repository&.full_name}: #{e.message}")
      raise
    end

    private

    def sync_contributors
      contributors_data = @client.contributors(owner: @repository.owner, repo: @repository.repo_name)

      contributors_data.each do |data|
        find_or_create_contributor(data)
      end

      Rails.logger.info("Synced #{contributors_data.size} contributors for #{@repository.full_name}")
    end

    def sync_commits
      since = @repository.last_synced_at || 90.days.ago

      commits_data = @client.commits(
        owner: @repository.owner,
        repo: @repository.repo_name,
        since: since
      )

      commits_data.each do |data|
        sync_commit(data)
      end

      Rails.logger.info("Synced #{commits_data.size} commits for #{@repository.full_name}")
    end

    def sync_pull_requests
      # Sync all PRs, but focus on recent activity for updates
      prs_data = @client.pull_requests(owner: @repository.owner, repo: @repository.repo_name, state: "all")

      prs_data.each do |data|
        pr = sync_pull_request(data)
        sync_reviews_for_pr(pr) if pr
      end

      Rails.logger.info("Synced #{prs_data.size} pull requests for #{@repository.full_name}")
    end

    def sync_issues
      issues_data = @client.issues(owner: @repository.owner, repo: @repository.repo_name, state: "all")

      # Filter out pull requests (GitHub API returns PRs as issues too)
      issues_data = issues_data.reject { |i| i["pull_request"].present? }

      issues_data.each do |data|
        sync_issue(data)
      end

      Rails.logger.info("Synced #{issues_data.size} issues for #{@repository.full_name}")
    end

    def find_or_create_contributor(data)
      return nil unless data["id"]

      @workspace.github_contributors.find_or_create_by!(github_id: data["id"]) do |c|
        c.login = data["login"]
        c.avatar_url = data["avatar_url"]
      end
    rescue ActiveRecord::RecordNotUnique
      @workspace.github_contributors.find_by!(github_id: data["id"])
    end

    def sync_commit(data)
      author_data = data.dig("author") || {}
      author = find_or_create_contributor(author_data) if author_data["id"]

      commit_data = data["commit"] || {}
      commit_author = commit_data["author"] || {}

      @repository.github_commits.find_or_initialize_by(sha: data["sha"]).tap do |commit|
        commit.author = author
        commit.message = commit_data["message"]
        commit.committed_at = commit_author["date"]
        commit.author_email = commit_author["email"]
        commit.author_name = commit_author["name"]

        # Stats might need a separate API call for full data
        if data["stats"]
          commit.additions = data["stats"]["additions"] || 0
          commit.deletions = data["stats"]["deletions"] || 0
          commit.files_changed = data["files"]&.size || 0
        end

        commit.save!
      end
    rescue ActiveRecord::RecordNotUnique
      # Skip duplicates
    end

    def sync_pull_request(data)
      author = find_or_create_contributor(data["user"]) if data.dig("user", "id")

      @repository.github_pull_requests.find_or_initialize_by(github_id: data["id"]).tap do |pr|
        pr.author = author
        pr.number = data["number"]
        pr.title = data["title"]
        pr.body = data["body"]
        pr.state = determine_pr_state(data)
        pr.draft = data["draft"] || false
        pr.additions = data["additions"] || 0
        pr.deletions = data["deletions"] || 0
        pr.changed_files = data["changed_files"] || 0
        pr.commits_count = data["commits"] || 0
        pr.opened_at = data["created_at"]
        pr.closed_at = data["closed_at"]
        pr.merged_at = data["merged_at"]
        pr.merged_by_login = data.dig("merged_by", "login")
        pr.head_ref = data.dig("head", "ref")
        pr.base_ref = data.dig("base", "ref")

        pr.save!
      end
    rescue ActiveRecord::RecordNotUnique
      @repository.github_pull_requests.find_by!(github_id: data["id"])
    end

    def determine_pr_state(data)
      if data["merged_at"]
        "merged"
      elsif data["state"] == "closed"
        "closed"
      else
        "open"
      end
    end

    def sync_reviews_for_pr(pr)
      reviews_data = @client.reviews(owner: @repository.owner, repo: @repository.repo_name, pull_number: pr.number)

      first_review_at = nil

      reviews_data.each do |data|
        reviewer = find_or_create_contributor(data["user"]) if data.dig("user", "id")

        pr.github_reviews.find_or_initialize_by(github_id: data["id"]).tap do |review|
          review.reviewer = reviewer
          review.state = data["state"]&.downcase || "pending"
          review.body = data["body"]
          review.submitted_at = data["submitted_at"]
          review.save!

          if review.submitted_at && (first_review_at.nil? || review.submitted_at < first_review_at)
            first_review_at = review.submitted_at
          end
        end
      rescue ActiveRecord::RecordNotUnique
        # Skip duplicates
      end

      # Update first_review_at on the PR
      pr.update!(first_review_at: first_review_at) if first_review_at && pr.first_review_at != first_review_at
    end

    def sync_issue(data)
      author = find_or_create_contributor(data["user"]) if data.dig("user", "id")

      @repository.github_issues.find_or_initialize_by(github_id: data["id"]).tap do |issue|
        issue.author = author
        issue.number = data["number"]
        issue.title = data["title"]
        issue.body = data["body"]
        issue.state = data["state"]
        issue.state_reason = data["state_reason"]
        issue.opened_at = data["created_at"]
        issue.closed_at = data["closed_at"]
        issue.labels = data["labels"]&.map { |l| { "name" => l["name"], "color" => l["color"] } } || []

        issue.save!
      end
    rescue ActiveRecord::RecordNotUnique
      # Skip duplicates
    end
  end
end
