# frozen_string_literal: true

class FeedbackController < InertiaController
  def create
    # TODO: Process feedback
    # feedback_text = params[:feedback]

    redirect_back fallback_location: root_path, notice: "Thank you for your feedback!"
  end
end
