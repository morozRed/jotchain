# frozen_string_literal: true

# GitHub App Configuration
#
# Required environment variables:
#   GITHUB_APP_ID          - The GitHub App ID (from GitHub App settings)
#   GITHUB_APP_NAME        - The GitHub App name (slug used in URLs)
#   GITHUB_APP_CLIENT_ID   - OAuth client ID for the GitHub App
#   GITHUB_APP_CLIENT_SECRET - OAuth client secret for the GitHub App
#   GITHUB_APP_PRIVATE_KEY - The private key for JWT authentication (PEM format)
#   GITHUB_APP_WEBHOOK_SECRET - The webhook secret for verifying webhook payloads
#
# Setup instructions:
# 1. Go to GitHub Settings > Developer Settings > GitHub Apps > New GitHub App
# 2. Configure the app:
#    - Name: JotChain (or your app name)
#    - Homepage URL: https://app.jotchain.com
#    - Webhook URL: https://app.jotchain.com/webhooks/github
#    - Webhook secret: Generate a secure random string
#    - Permissions:
#      - Repository: Contents (read), Issues (read), Pull requests (read), Metadata (read)
#      - Organization: Members (read)
#    - Subscribe to events:
#      - Push, Pull request, Pull request review, Issues
# 3. After creating, generate a private key and download it
# 4. Set all environment variables

module GitHubApp
  class << self
    def app_id
      ENV.fetch("GITHUB_APP_ID", nil)
    end

    def app_name
      ENV.fetch("GITHUB_APP_NAME", "jotchain")
    end

    def client_id
      ENV.fetch("GITHUB_APP_CLIENT_ID", nil)
    end

    def client_secret
      ENV.fetch("GITHUB_APP_CLIENT_SECRET", nil)
    end

    def private_key
      key = ENV.fetch("GITHUB_APP_PRIVATE_KEY", nil)
      return nil unless key

      # Handle newlines that may be escaped in environment variables
      key.gsub('\n', "\n")
    end

    def webhook_secret
      ENV.fetch("GITHUB_APP_WEBHOOK_SECRET", nil)
    end

    def configured?
      app_id.present? && client_id.present? && client_secret.present? && private_key.present?
    end

    def installation_url
      "https://github.com/apps/#{app_name}/installations/new"
    end

    def oauth_authorize_url(state:, redirect_uri:)
      params = {
        client_id: client_id,
        redirect_uri: redirect_uri,
        state: state
      }
      "https://github.com/login/oauth/authorize?#{params.to_query}"
    end

    # Generate a JWT for authenticating as the GitHub App
    def jwt
      return nil unless private_key && app_id

      private_pem = OpenSSL::PKey::RSA.new(private_key)
      payload = {
        iat: Time.now.to_i - 60,
        exp: Time.now.to_i + (10 * 60), # 10 minutes max
        iss: app_id
      }
      JWT.encode(payload, private_pem, "RS256")
    end
  end
end
