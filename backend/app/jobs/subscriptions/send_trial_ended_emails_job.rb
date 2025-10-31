# frozen_string_literal: true

module Subscriptions
  class SendTrialEndedEmailsJob < ApplicationJob
    queue_as :default

    def perform(now: Time.current)
      now = now.in_time_zone("UTC")

      # Send trial ended email to users whose trial ended yesterday
      send_trial_ended_emails(now)

      # Send trial reminder email to users whose trial ended 30 days ago
      send_trial_reminder_emails(now)
    end

    private

    def send_trial_ended_emails(now)
      yesterday = now.beginning_of_day - 1.day

      User
        .where(subscription_status: "trialing")
        .where("trial_ends_at >= ? AND trial_ends_at < ?", yesterday, yesterday + 1.day)
        .find_each do |user|
          SubscriptionMailer.trial_ended_email(user).deliver_later
        end
    end

    def send_trial_reminder_emails(now)
      thirty_days_ago = now.beginning_of_day - 30.days

      User
        .where(subscription_status: "trialing")
        .where("trial_ends_at >= ? AND trial_ends_at < ?", thirty_days_ago, thirty_days_ago + 1.day)
        .find_each do |user|
          SubscriptionMailer.trial_reminder_email(user).deliver_later
        end
    end
  end
end
