# frozen_string_literal: true

module Signals
  class ScanAllJob < ApplicationJob
    queue_as :low

    def perform
      # Find users with entries in the last 14 days
      active_user_ids = Entry
        .where("logged_at > ?", 14.days.ago)
        .distinct
        .pluck(:user_id)

      active_user_ids.each do |user_id|
        DetectJob.perform_later(user_id)
      end

      Rails.logger.info "[Signals::ScanAllJob] Enqueued detection for #{active_user_ids.size} users"
    end
  end
end
