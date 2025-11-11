# frozen_string_literal: true

class InsightsController < InertiaController
  before_action :set_insight, only: [:show, :update, :destroy]

  def index
    recent_insights = Current.user.insight_requests
      .completed
      .recent_first
      .limit(10)

    render inertia: "insights/index", props: {
      recentInsights: insight_payloads(recent_insights),
      meta: meta_payload
    }
  end

  def create
    insight = Current.user.insight_requests.build(insight_params)

    if insight.save
      # Enqueue job to generate insight asynchronously
      Insights::GenerateJob.perform_later(insight.id)

      render json: {
        id: insight.id,
        status: insight.status
      }
    else
      render json: {errors: insight.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def show
    # Used for polling status during generation
    render json: insight_payload(@insight)
  end

  def update
    # Allow updating content (after user edits)
    if @insight.update(update_params)
      render json: {success: true}
    else
      render json: {errors: @insight.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def destroy
    @insight.destroy
    redirect_to insights_path, notice: "Insight deleted"
  end

  def history
    page = params[:page]&.to_i || 1
    per_page = 20
    offset = (page - 1) * per_page

    # Filter to show only pending or completed (succeeded) insights
    insights = Current.user.insight_requests
      .where(status: %w[pending completed])
      .recent_first
      .limit(per_page)
      .offset(offset)

    total_count = Current.user.insight_requests.where(status: %w[pending completed]).count

    render inertia: "insights/history", props: {
      insights: insight_payloads(insights),
      pagination: {
        currentPage: page,
        perPage: per_page,
        totalCount: total_count,
        totalPages: (total_count.to_f / per_page).ceil
      }
    }
  end

  private

  def set_insight
    @insight = Current.user.insight_requests.find(params[:id])
  end

  def insight_params
    permitted = params.require(:insight_request).permit(
      :query_type,
      :custom_query,
      :date_range_start,
      :date_range_end,
      project_ids: [],
      person_ids: []
    )

    # Auto-generate name
    permitted[:name] = generate_insight_name(permitted)

    # Ensure arrays are properly formatted
    permitted[:project_ids] = Array(permitted[:project_ids]).reject(&:blank?)
    permitted[:person_ids] = Array(permitted[:person_ids]).reject(&:blank?)

    permitted.to_h
  end

  def update_params
    params.require(:insight_request).permit(:content)
  end

  def generate_insight_name(params)
    query_type = params[:query_type]&.titleize || "Custom Insight"
    start_date = Date.parse(params[:date_range_start].to_s) rescue nil
    end_date = Date.parse(params[:date_range_end].to_s) rescue nil

    if start_date && end_date
      date_range = "#{start_date.strftime('%b %d')} - #{end_date.strftime('%b %d')}"
      "#{query_type} • #{date_range}"
    else
      query_type
    end
  end

  def insight_payloads(insights)
    insights.map { |insight| insight_payload(insight) }
  end

  def insight_payload(insight)
    {
      id: insight.id,
      name: insight.name,
      queryType: insight.query_type,
      customQuery: insight.custom_query,
      dateRangeStart: insight.date_range_start&.iso8601,
      dateRangeEnd: insight.date_range_end&.iso8601,
      projectIds: insight.project_ids || [],
      personIds: insight.person_ids || [],
      status: insight.status,
      resultPayload: insight.result_payload,
      content: insight.content,
      resultModel: insight.result_model,
      promptTokens: insight.prompt_tokens,
      completionTokens: insight.completion_tokens,
      errorMessage: insight.error_message,
      completedAt: insight.completed_at&.iso8601,
      createdAt: insight.created_at.iso8601
    }
  end

  def meta_payload
    {
      projects: project_options,
      persons: person_options,
      queryTypes: query_type_options,
      datePresets: date_preset_options
    }
  end

  def project_options
    Current.user.projects.alphabetical.map do |project|
      {value: project.id, label: project.name, color: project.color}
    end
  end

  def person_options
    Current.user.persons.alphabetical.map do |person|
      {value: person.id, label: person.name}
    end
  end

  def query_type_options
    [
      {value: "summary", label: "Summary", description: "Quick recap of your work (150-300 words)"},
      {value: "tweets", label: "Tweet Thread", description: "3-5 tweets for X/LinkedIn"},
      {value: "review", label: "Performance Review", description: "Formal accomplishments summary"},
      {value: "blog", label: "Blog Post Draft", description: "Long-form article (800-1200 words)"},
      {value: "update", label: "Team Update", description: "Status email for stakeholders"},
      {value: "ideas", label: "Content Ideas", description: "10-15 brainstormed topics"}
    ]
  end

  def date_preset_options
    [
      {value: "last_7_days", label: "Last 7 days"},
      {value: "last_14_days", label: "Last 14 days"},
      {value: "last_30_days", label: "Last 30 days"},
      {value: "this_week", label: "This week"},
      {value: "this_month", label: "This month"},
      {value: "this_quarter", label: "This quarter"},
      {value: "this_year", label: "This year"},
      {value: "custom", label: "Custom range"}
    ]
  end
end
