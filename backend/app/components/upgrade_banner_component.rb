# frozen_string_literal: true

class UpgradeBannerComponent < ViewComponent::Base
  def initialize(user:, context: :general)
    @user = user
    @context = context
    @subscription = user.subscription
  end

  def render?
    @subscription.nil? || @subscription.free?
  end

  private

  attr_reader :user, :context, :subscription

  def message
    case context
    when :history_limit
      "Upgrade to Pro for unlimited history!"
    when :ai_insights
      "Unlock AI-powered insights to generate content from your journal entries"
    when :export
      "Export your journal in multiple formats with a Pro subscription"
    else
      "You're on the Free plan. Upgrade to Pro for unlimited history, AI insights, and more!"
    end
  end

  def cta_text
    case context
    when :history_limit
      "Get Unlimited History"
    when :ai_insights
      "Unlock AI Insights"
    when :export
      "Enable Export"
    else
      "Upgrade to Pro"
    end
  end
end
