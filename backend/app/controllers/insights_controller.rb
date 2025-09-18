class InsightsController < ApplicationController
  before_action :authenticate_user!

  def index
    @has_entries = current_user.entries.any?
    @has_wins = current_user.entries.wins.any?
    @entries_count = current_user.entries.count
    @wins_count = current_user.total_wins
  end

  def create
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
end