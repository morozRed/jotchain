# frozen_string_literal: true

module Webhooks
  class GithubController < ApplicationController
    skip_before_action :authenticate
    skip_before_action :verify_authenticity_token

    before_action :verify_webhook_signature

    def create
      event = request.headers["X-GitHub-Event"]
      delivery_id = request.headers["X-GitHub-Delivery"]

      Rails.logger.info("Received GitHub webhook: #{event} (#{delivery_id})")

      case event
      when "installation"
        handle_installation_event
      when "installation_repositories"
        handle_installation_repositories_event
      when "push"
        handle_push_event
      when "pull_request"
        handle_pull_request_event
      when "pull_request_review"
        handle_pull_request_review_event
      when "issues"
        handle_issues_event
      when "ping"
        handle_ping_event
      else
        Rails.logger.info("Unhandled GitHub webhook event: #{event}")
      end

      head :ok
    end

    private

    def verify_webhook_signature
      unless GitHubApp.webhook_secret.present?
        Rails.logger.warn("GitHub webhook secret not configured")
        return
      end

      signature = request.headers["X-Hub-Signature-256"]
      unless signature
        Rails.logger.warn("Missing GitHub webhook signature")
        head :unauthorized and return
      end

      payload = request.raw_post
      expected_signature = "sha256=" + OpenSSL::HMAC.hexdigest(
        OpenSSL::Digest.new("sha256"),
        GitHubApp.webhook_secret,
        payload
      )

      unless Rack::Utils.secure_compare(expected_signature, signature)
        Rails.logger.warn("Invalid GitHub webhook signature")
        head :unauthorized and return
      end
    end

    def webhook_payload
      @webhook_payload ||= JSON.parse(request.raw_post)
    end

    def installation
      @installation ||= begin
        installation_id = webhook_payload.dig("installation", "id")
        GitHubInstallation.find_by(installation_id: installation_id)
      end
    end

    def repository
      @repository ||= begin
        return nil unless installation

        repo_id = webhook_payload.dig("repository", "id")
        installation.github_repositories.find_by(github_id: repo_id)
      end
    end

    # Event handlers

    def handle_installation_event
      action = webhook_payload["action"]
      installation_id = webhook_payload.dig("installation", "id")

      case action
      when "created"
        Rails.logger.info("New GitHub installation: #{installation_id}")
        # Installation is created via callback flow, not webhook
      when "deleted"
        GitHubInstallation.find_by(installation_id: installation_id)&.destroy
        Rails.logger.info("GitHub installation deleted: #{installation_id}")
      when "suspend"
        GitHubInstallation.find_by(installation_id: installation_id)&.update(suspended_at: Time.current)
        Rails.logger.info("GitHub installation suspended: #{installation_id}")
      when "unsuspend"
        GitHubInstallation.find_by(installation_id: installation_id)&.update(suspended_at: nil)
        Rails.logger.info("GitHub installation unsuspended: #{installation_id}")
      end
    end

    def handle_installation_repositories_event
      return unless installation

      action = webhook_payload["action"]
      repos_added = webhook_payload["repositories_added"] || []
      repos_removed = webhook_payload["repositories_removed"] || []

      if action == "added" || repos_added.any?
        repos_added.each do |repo_data|
          installation.github_repositories.find_or_create_by!(github_id: repo_data["id"]) do |repo|
            repo.name = repo_data["name"]
            repo.full_name = repo_data["full_name"]
            repo.private = repo_data["private"]
          end
        end
      end

      if action == "removed" || repos_removed.any?
        repo_ids = repos_removed.map { |r| r["id"] }
        installation.github_repositories.where(github_id: repo_ids).destroy_all
      end
    end

    def handle_push_event
      return unless repository&.sync_enabled?

      commits_data = webhook_payload["commits"] || []
      return if commits_data.empty?

      commits_data.each do |commit_data|
        sync_commit_from_push(commit_data)
      end

      Rails.logger.info("Processed #{commits_data.size} commits via push webhook for #{repository.full_name}")
    end

    def handle_pull_request_event
      return unless repository&.sync_enabled?

      pr_data = webhook_payload["pull_request"]
      return unless pr_data

      sync_pull_request_from_webhook(pr_data)
      Rails.logger.info("Processed PR ##{pr_data['number']} via webhook for #{repository.full_name}")
    end

    def handle_pull_request_review_event
      return unless repository&.sync_enabled?

      review_data = webhook_payload["review"]
      pr_data = webhook_payload["pull_request"]
      return unless review_data && pr_data

      # Ensure PR exists
      pr = repository.github_pull_requests.find_by(github_id: pr_data["id"])
      pr ||= sync_pull_request_from_webhook(pr_data)
      return unless pr

      sync_review_from_webhook(pr, review_data)
      Rails.logger.info("Processed review for PR ##{pr_data['number']} via webhook")
    end

    def handle_issues_event
      return unless repository&.sync_enabled?

      issue_data = webhook_payload["issue"]
      return unless issue_data
      return if issue_data["pull_request"].present? # Skip PRs

      sync_issue_from_webhook(issue_data)
      Rails.logger.info("Processed issue ##{issue_data['number']} via webhook for #{repository.full_name}")
    end

    def handle_ping_event
      Rails.logger.info("GitHub webhook ping received: #{webhook_payload['zen']}")
    end

    # Sync helpers

    def find_or_create_contributor(user_data)
      return nil unless user_data&.dig("id") && installation

      installation.workspace.github_contributors.find_or_create_by!(github_id: user_data["id"]) do |c|
        c.login = user_data["login"]
        c.avatar_url = user_data["avatar_url"]
      end
    rescue ActiveRecord::RecordNotUnique
      installation.workspace.github_contributors.find_by!(github_id: user_data["id"])
    end

    def sync_commit_from_push(commit_data)
      author_data = webhook_payload["sender"]
      author = find_or_create_contributor(author_data)

      repository.github_commits.find_or_create_by!(sha: commit_data["id"]) do |commit|
        commit.author = author
        commit.message = commit_data["message"]
        commit.committed_at = commit_data["timestamp"]
        commit.author_email = commit_data.dig("author", "email")
        commit.author_name = commit_data.dig("author", "name")
        commit.additions = commit_data["added"]&.size || 0
        commit.deletions = commit_data["removed"]&.size || 0
        commit.files_changed = (commit_data["added"]&.size || 0) +
                               (commit_data["removed"]&.size || 0) +
                               (commit_data["modified"]&.size || 0)
      end
    rescue ActiveRecord::RecordNotUnique
      # Already exists, skip
    end

    def sync_pull_request_from_webhook(pr_data)
      author = find_or_create_contributor(pr_data["user"])

      repository.github_pull_requests.find_or_initialize_by(github_id: pr_data["id"]).tap do |pr|
        pr.author = author
        pr.number = pr_data["number"]
        pr.title = pr_data["title"]
        pr.body = pr_data["body"]
        pr.state = determine_pr_state(pr_data)
        pr.draft = pr_data["draft"] || false
        pr.additions = pr_data["additions"] || 0
        pr.deletions = pr_data["deletions"] || 0
        pr.changed_files = pr_data["changed_files"] || 0
        pr.commits_count = pr_data["commits"] || 0
        pr.opened_at = pr_data["created_at"]
        pr.closed_at = pr_data["closed_at"]
        pr.merged_at = pr_data["merged_at"]
        pr.merged_by_login = pr_data.dig("merged_by", "login")
        pr.head_ref = pr_data.dig("head", "ref")
        pr.base_ref = pr_data.dig("base", "ref")

        pr.save!
      end
    rescue ActiveRecord::RecordNotUnique
      repository.github_pull_requests.find_by!(github_id: pr_data["id"])
    end

    def determine_pr_state(pr_data)
      if pr_data["merged_at"]
        "merged"
      elsif pr_data["state"] == "closed"
        "closed"
      else
        "open"
      end
    end

    def sync_review_from_webhook(pr, review_data)
      reviewer = find_or_create_contributor(review_data["user"])

      pr.github_reviews.find_or_create_by!(github_id: review_data["id"]) do |review|
        review.reviewer = reviewer
        review.state = review_data["state"]&.downcase || "pending"
        review.body = review_data["body"]
        review.submitted_at = review_data["submitted_at"]
      end

      # Update first_review_at if this is earlier
      if pr.first_review_at.nil? || (review_data["submitted_at"] && Time.parse(review_data["submitted_at"]) < pr.first_review_at)
        pr.update!(first_review_at: review_data["submitted_at"])
      end
    rescue ActiveRecord::RecordNotUnique
      # Already exists, skip
    end

    def sync_issue_from_webhook(issue_data)
      author = find_or_create_contributor(issue_data["user"])

      repository.github_issues.find_or_initialize_by(github_id: issue_data["id"]).tap do |issue|
        issue.author = author
        issue.number = issue_data["number"]
        issue.title = issue_data["title"]
        issue.body = issue_data["body"]
        issue.state = issue_data["state"]
        issue.state_reason = issue_data["state_reason"]
        issue.opened_at = issue_data["created_at"]
        issue.closed_at = issue_data["closed_at"]
        issue.labels = issue_data["labels"]&.map { |l| { "name" => l["name"], "color" => l["color"] } } || []

        issue.save!
      end
    rescue ActiveRecord::RecordNotUnique
      # Already exists, skip
    end
  end
end
