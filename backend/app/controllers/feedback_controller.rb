# frozen_string_literal: true

class FeedbackController < InertiaController
  def create
    user_agent = UserAgentParser.parse(Current.user_agent)

    feedback_data = {
      user: Current.user,
      message: feedback_params[:feedback],
      device: "#{user_agent.name} #{user_agent.version}",
      app_version: user_agent.version.to_s,
      os_version: "#{user_agent.os.name} #{user_agent.os.version}",
      ip_address: Current.ip_address,
      timestamp: Time.current
    }

    TelegramService.new.send_feedback(feedback_data)

    redirect_back fallback_location: root_path, notice: "Thank you for your feedback!"
  rescue => e
    Rails.logger.error "Failed to process feedback: #{e.message}"
    redirect_back fallback_location: root_path, notice: "Thank you for your feedback!"
  end

  private

  def feedback_params
    params.permit(:feedback)
  end
end
