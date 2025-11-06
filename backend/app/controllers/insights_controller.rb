# frozen_string_literal: true

class InsightsController < InertiaController
  def index
    render inertia: "insights/index"
  end
end
