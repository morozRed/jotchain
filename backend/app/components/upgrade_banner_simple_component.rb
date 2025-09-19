# frozen_string_literal: true

class UpgradeBannerSimpleComponent < ViewComponent::Base
  def initialize(user:, sidebar: false)
    @user = user
    @subscription = user.subscription
    @sidebar = sidebar
  end

  def render?
    @subscription.nil? || @subscription.free?
  end

  private

  attr_reader :user, :subscription, :sidebar

  def message
    "Upgrade to Pro for unlimited history!"
  end

  def cta_text
    "Upgrade to Pro"
  end
end
