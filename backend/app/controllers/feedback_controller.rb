class FeedbackController < ApplicationController
  before_action :authenticate_user!

  def new
    @feedback_types = [
      ['Bug Report', 'bug'],
      ['Feature Request', 'feature'],
      ['General Feedback', 'general'],
      ['Other', 'other']
    ]
  end

  def create
    feedback_type = params[:feedback_type]
    feedback_message = params[:feedback_message]

    if feedback_message.present?
      # For now, we'll just log the feedback. You can later integrate with email or a service
      Rails.logger.info "FEEDBACK from #{current_user.email}: [#{feedback_type}] #{feedback_message}"

      # You could also send an email here
      # FeedbackMailer.new_feedback(current_user, feedback_type, feedback_message).deliver_later

      redirect_to root_path, notice: "Thank you for your feedback! We appreciate your input."
    else
      flash[:alert] = "Please provide feedback message."
      redirect_to new_feedback_path
    end
  end
end