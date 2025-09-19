# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]
  before_action :configure_account_update_params, only: [:update]

  # GET /resource/edit
  def edit
    @active_tab = determine_active_tab
    super
  end

  # PUT /resource
  def update
    @active_tab = determine_active_tab
    
    # Handle different types of updates based on which form was submitted
    if updating_password?
      update_password
    else
      update_profile
    end
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
  end

  def configure_account_update_params
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  private

  def determine_active_tab
    return 'password' if params[:commit] == 'Update Password'
    return 'profile' if params[:commit] == 'Update Profile'
    
    # Default to profile tab, or password tab if there are password-related errors
    if resource.errors.any? && password_related_errors?
      'password'
    else
      'profile'
    end
  end

  def updating_password?
    params[:commit] == 'Update Password' || 
    (params[:user][:password].present? || params[:user][:password_confirmation].present?)
  end

  def password_related_errors?
    resource.errors.any? { |error| error.attribute.to_s.include?('password') }
  end

  def update_password
    # Only allow password-related fields for password updates
    account_update_params = devise_parameter_sanitizer.sanitize(:account_update)
    filtered_params = account_update_params.slice(:password, :password_confirmation, :current_password)
    
    if resource.update_with_password(filtered_params)
      bypass_sign_in resource, scope: resource_name if sign_in_after_change_password?
      redirect_to edit_user_registration_path, notice: 'Password updated successfully.'
    else
      clean_up_passwords resource
      set_minimum_password_length
      render :edit, status: :unprocessable_entity
    end
  end

  def update_profile
    # Only allow profile-related fields for profile updates
    account_update_params = devise_parameter_sanitizer.sanitize(:account_update)
    filtered_params = account_update_params.slice(:email, :current_password)
    
    if resource.update_with_password(filtered_params)
      bypass_sign_in resource, scope: resource_name
      redirect_to edit_user_registration_path, notice: 'Profile updated successfully.'
    else
      clean_up_passwords resource
      render :edit, status: :unprocessable_entity
    end
  end

  def after_update_path_for(resource)
    edit_user_registration_path
  end

  def sign_in_after_change_password?
    true
  end
end
