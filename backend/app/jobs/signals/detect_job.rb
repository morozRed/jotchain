# frozen_string_literal: true

module Signals
  class DetectJob < ApplicationJob
    queue_as :default

    # Limit concurrent detection jobs per user
    limits_concurrency to: 1, key: ->(user_id) { "signal_detection_#{user_id}" }

    def perform(user_id)
      user = User.find(user_id)

      # Skip if user doesn't have active subscription
      return unless user.can_receive_notifications?

      result = Detector.new(user: user).call

      if result.error?
        Rails.logger.error "[Signals::DetectJob] Error for user #{user_id}: #{result.error_message}"
      else
        Rails.logger.info "[Signals::DetectJob] User #{user_id}: created=#{result.signals_created}, updated=#{result.signals_updated}"
      end
    end
  end
end
