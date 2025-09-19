class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @today = Date.current
    @entry = current_user.entries.where(entry_date: @today).first_or_initialize
    @yesterday_entry = current_user.yesterdays_entry
    @recent_entries = current_user.recent_entries(5)
    @current_streak = current_user.current_streak
    @user_first_name = extract_first_name(current_user.email)
    @can_use_ai_insights = current_user.can_use_ai_insights?
    @has_entries = current_user.entries.any?
  end

  private

  def extract_first_name(email)
    # Extract the part before @
    name_part = email.split('@').first

    # Try to get first name from common patterns
    if name_part.include?('.')
      # Handle firstname.lastname format
      name_part.split('.').first.capitalize
    elsif name_part.include?('_')
      # Handle firstname_lastname format
      name_part.split('_').first.capitalize
    else
      # Just use the whole part before @ and capitalize
      name_part.capitalize
    end
  end

  def show
    redirect_to action: :index
  end
end
