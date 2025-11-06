# frozen_string_literal: true

class AnalyticsController < InertiaController
  def index
    render inertia: "analytics/index"
  end
end
