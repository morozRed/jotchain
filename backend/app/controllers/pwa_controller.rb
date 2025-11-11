# frozen_string_literal: true

class PwaController < ActionController::Base
  # Skip authentication for PWA manifest
  skip_before_action :verify_authenticity_token

  def manifest
    render "pwa/manifest", formats: :json, content_type: "application/manifest+json"
  end
end

