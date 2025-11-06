# frozen_string_literal: true

module Api
  class AnalyticsController < Api::BaseController
    def show
      range = params[:range] || "week"
      project_id = params[:project_id].presence
      tz = params[:tz] || "UTC"

      # Validate range
      unless %w[week month year].include?(range)
        return render_error("Invalid range. Must be one of: week, month, year", status: :bad_request)
      end

      # Validate timezone
      unless ActiveSupport::TimeZone[tz]
        return render_error("Invalid timezone", status: :bad_request)
      end

      # Validate project if provided
      project = nil
      if project_id.present?
        project = Current.user.projects.find_by(id: project_id)
        unless project
          return render_error("Project not found", status: :not_found)
        end
      end

      calculator = Analytics::Calculator.new(
        user: Current.user,
        range: range.to_sym,
        project: project,
        timezone: tz
      )

      data = calculator.call

      render json: data
    end
  end
end
