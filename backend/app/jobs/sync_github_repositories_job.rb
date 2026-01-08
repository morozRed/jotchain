# frozen_string_literal: true

class SyncGithubRepositoriesJob < ApplicationJob
  queue_as :default

  def perform(installation_id)
    installation = GitHubInstallation.find_by(id: installation_id)
    return unless installation

    access_token = installation.valid_access_token
    return unless access_token

    # Fetch repositories from GitHub
    repositories = fetch_repositories(installation, access_token)

    # Sync repositories
    repositories.each do |repo_data|
      sync_repository(installation, repo_data)
    end

    Rails.logger.info("Synced #{repositories.size} repositories for installation #{installation.id}")
  end

  private

  def fetch_repositories(installation, access_token)
    all_repos = []
    page = 1

    loop do
      response = HTTParty.get(
        "https://api.github.com/installation/repositories",
        headers: {
          "Authorization" => "Bearer #{access_token}",
          "Accept" => "application/vnd.github+json",
          "X-GitHub-Api-Version" => "2022-11-28"
        },
        query: { per_page: 100, page: page }
      )

      break unless response.success?

      repos = response["repositories"] || []
      break if repos.empty?

      all_repos.concat(repos)
      break if repos.size < 100

      page += 1
    end

    all_repos
  end

  def sync_repository(installation, repo_data)
    repo = installation.github_repositories.find_or_initialize_by(github_id: repo_data["id"])

    repo.assign_attributes(
      name: repo_data["name"],
      full_name: repo_data["full_name"],
      private: repo_data["private"],
      default_branch: repo_data["default_branch"] || "main",
      language: repo_data["language"],
      description: repo_data["description"]
    )

    repo.save!
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("Failed to sync repository #{repo_data['full_name']}: #{e.message}")
  end
end
