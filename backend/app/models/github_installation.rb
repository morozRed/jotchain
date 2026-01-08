# frozen_string_literal: true

class GitHubInstallation < ApplicationRecord
  belongs_to :workspace
  has_many :github_repositories, dependent: :destroy

  encrypts :access_token

  validates :installation_id, presence: true, uniqueness: true
  validates :account_login, presence: true
  validates :account_type, presence: true, inclusion: { in: %w[Organization User] }
  validates :account_id, presence: true

  scope :active, -> { where(suspended_at: nil) }
  scope :suspended, -> { where.not(suspended_at: nil) }

  def organization?
    account_type == "Organization"
  end

  def user_account?
    account_type == "User"
  end

  def suspended?
    suspended_at.present?
  end

  def access_token_valid?
    access_token.present? && access_token_expires_at&.future?
  end

  def syncable_repositories
    github_repositories.where(sync_enabled: true)
  end

  # Refresh the installation access token using the GitHub App JWT
  def refresh_access_token!
    return unless GitHubApp.configured?

    response = HTTParty.post(
      "https://api.github.com/app/installations/#{installation_id}/access_tokens",
      headers: {
        "Authorization" => "Bearer #{GitHubApp.jwt}",
        "Accept" => "application/vnd.github+json",
        "X-GitHub-Api-Version" => "2022-11-28"
      }
    )

    if response.success?
      update!(
        access_token: response["token"],
        access_token_expires_at: Time.parse(response["expires_at"])
      )
      true
    else
      Rails.logger.error("Failed to refresh GitHub access token: #{response.body}")
      false
    end
  end

  # Get a valid access token, refreshing if necessary
  def valid_access_token
    refresh_access_token! unless access_token_valid?
    access_token
  end
end
