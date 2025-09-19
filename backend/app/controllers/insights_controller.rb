class InsightsController < ApplicationController
  before_action :authenticate_user!
  before_action :check_ai_access

  def index
    @has_entries = current_user.entries.any?
    @has_wins = current_user.entries.wins.any?
    @entries_count = current_user.entries.count
    @wins_count = current_user.total_wins
  end

  def create
    # Log usage
    log_ai_usage(params[:insight_type])

    service = AiInsightsService.new(current_user)
    insight_type = params[:insight_type]
    timeframe = params[:timeframe] || 'week'

    result = case insight_type
    when 'tweets'
      service.generate_tweet_suggestions(timeframe)
    when 'blog'
      service.generate_blog_ideas(timeframe)
    when 'wins_summary'
      service.generate_wins_summary(timeframe)
    when 'meeting_prep'
      meeting_type = params[:meeting_type] || 'weekly'
      service.generate_meeting_prep(meeting_type)
    else
      { error: "Invalid insight type" }
    end

    if result[:error]
      render json: { error: result[:error] }, status: :unprocessable_entity
    else
      render json: result
    end
  end

  private

  def check_ai_access
    unless current_user.can_use_ai_insights?
      respond_to do |format|
        format.html do
          flash[:alert] = "AI insights are only available for Pro users."
          redirect_to billing_path
        end
        format.json do
          render json: { error: "AI insights are only available for Pro users." }, status: :forbidden
        end
      end
    end
  end

  def log_ai_usage(insight_type)
    current_user.ai_usage_logs.create!(
      insight_type: map_insight_type(insight_type),
      tokens_used: 0, # Will be updated by the service
      metadata: {
        requested_at: Time.current,
        ip_address: request.remote_ip
      }
    )
  end

  def map_insight_type(type)
    case type
    when 'tweets'
      'personal_update'
    when 'blog'
      'personal_update'
    when 'wins_summary'
      'weekly_summary'
    when 'meeting_prep'
      'executive_summary'
    else
      'personal_update'
    end
  end
end