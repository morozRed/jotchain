# frozen_string_literal: true

class OauthCallbacksController < ApplicationController
  skip_before_action :authenticate, only: [ :create, :failure ]

  def create
    auth = request.env["omniauth.auth"]

    # Find or create user from OAuth data
    user = User.from_omniauth(auth)

    # Create a new session for the user
    session = user.sessions.create!(
      user_agent: request.user_agent,
      ip_address: request.remote_ip
    )

    # Set the session cookie
    cookies.signed.permanent[:session_token] = { value: session.id, httponly: true }

    # Redirect to dashboard
    redirect_to root_path, notice: "Successfully signed in with Google!"
  rescue StandardError => e
    Rails.logger.error "OAuth authentication failed: #{e.message}"
    redirect_to sign_in_path, alert: "Authentication failed. Please try again."
  end

  def failure
    redirect_to sign_in_path, alert: "Authentication failed: #{params[:message]}"
  end
end
