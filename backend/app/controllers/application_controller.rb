class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :ensure_user_has_subscription, if: :user_signed_in?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || root_path
  end

  def after_sign_out_path_for(resource_or_scope)
    new_user_session_path
  end

  private

  def ensure_user_has_subscription
    return if current_user.subscription.present?
    current_user.create_subscription!(plan_name: 'free', status: 'active')
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "Failed to create subscription for user #{current_user.id}: #{e.message}"
  end
end
