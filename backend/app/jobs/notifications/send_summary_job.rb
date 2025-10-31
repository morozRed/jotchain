# frozen_string_literal: true

module Notifications
  class SendSummaryJob < ApplicationJob
    queue_as :default

    def perform(delivery_id)
      delivery = NotificationDelivery.find(delivery_id)

      # Skip if user doesn't have an active subscription or trial
      unless delivery.user.can_receive_notifications?
        mark_skipped(delivery, OpenStruct.new(payload: {reason: "No active subscription"}, model: nil, usage: nil))
        return
      end

      return unless ensure_ready(delivery)

      builder_result = generate_summary(delivery)

      if builder_result.empty?
        mark_skipped(delivery, builder_result)
        return
      end

      if builder_result.error?
        mark_failed(delivery, builder_result.error_message, builder_result)
        raise Summaries::DigestBuilder::Error, builder_result.error_message
      end

      mark_generating_success(delivery, builder_result)
      begin
        deliver_email(delivery)
        mark_delivered(delivery)
      rescue StandardError => e
        mark_failed(delivery, e.message)
        raise
      end
    end

    private

    def ensure_ready(delivery)
      delivery.with_lock do
        if delivery.trigger_at.future?
          self.class.set(wait_until: delivery.trigger_at).perform_later(delivery.id)
          return false
        end

        return false unless delivery.pending_status?

        delivery.update!(status: :generating)
      end

      true
    rescue ActiveRecord::StaleObjectError
      false
    end

    def generate_summary(delivery)
      Summaries::DigestBuilder.new(
        user: delivery.user,
        window: {start: delivery.window_start, end: delivery.window_end},
        schedule: delivery.notification_schedule
      ).call
    end

    def mark_skipped(delivery, result)
      delivery.update!(
        status: :skipped,
        summary_payload: result.payload,
        summary_model: result.model,
        prompt_tokens: result.usage&.fetch(:prompt_tokens, nil),
        completion_tokens: result.usage&.fetch(:completion_tokens, nil),
        delivered_at: Time.current
      )
    end

    def mark_failed(delivery, error_message, result = nil)
      attrs = {
        status: :failed,
        error_message: error_message,
        delivered_at: nil
      }

      if result
        attrs[:summary_payload] = result.payload
        attrs[:summary_model] = result.model
        attrs[:prompt_tokens] = result.usage&.fetch(:prompt_tokens, nil)
        attrs[:completion_tokens] = result.usage&.fetch(:completion_tokens, nil)
      end

      delivery.update!(attrs)
    end

    def mark_generating_success(delivery, result)
      delivery.update!(
        status: :delivering,
        summary_payload: result.payload,
        summary_model: result.model,
        prompt_tokens: result.usage&.fetch(:prompt_tokens, nil),
        completion_tokens: result.usage&.fetch(:completion_tokens, nil)
      )
    end

    def deliver_email(delivery)
      SummaryMailer.with(delivery: delivery).digest.deliver_now
    end

    def mark_delivered(delivery)
      delivery.update!(
        status: :delivered,
        delivered_at: Time.current
      )
    end
  end
end
