# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :set_current_request_details
  before_action :authenticate

  private

  def authenticate
    redirect_to sign_in_path unless perform_authentication
  end

  def require_no_authentication
    return unless perform_authentication

    flash[:notice] = "You are already signed in"
    redirect_to root_path
  end

  def perform_authentication
    Current.session ||= Session.find_by_id(cookies.signed[:session_token])
  end

  def set_current_request_details
    Current.user_agent = request.user_agent
    Current.ip_address = request.ip
  end

  def datafast_visitor_id
    cookies[:datafast_visitor_id].presence
  end

  def track_datafast_goal(goal_method, metadata: nil)
    visitor_id = datafast_visitor_id
    return unless visitor_id.present?

    Datafast::Goals.public_send(goal_method, visitor_id:, metadata:)
  rescue NoMethodError, Datafast::Base::Error => e
    Rails.logger.warn("[Datafast] Failed to track #{goal_method}: #{e.message}")
  end
end
