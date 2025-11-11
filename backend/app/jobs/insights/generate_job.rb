# frozen_string_literal: true

module Insights
  class GenerateJob < ApplicationJob
    queue_as :default

    def perform(insight_request_id)
      insight = InsightRequest.find(insight_request_id)

      # Check subscription (insights require active subscription like notifications)
      unless insight.user.can_receive_notifications?
        mark_failed(insight, "Subscription required for insights")
        return
      end

      # Update status to generating
      insight.update!(status: "generating")

      # Generate the insight
      result = Insights::Generator.new(
        user: insight.user,
        insight_request: insight
      ).call

      if result.empty?
        mark_failed(insight, result.error_message)
        return
      end

      if result.error?
        mark_failed(insight, result.error_message)
        raise Insights::Generator::Error, result.error_message
      end

      mark_completed(insight, result)
    rescue StandardError => e
      mark_failed(insight, e.message)
      raise
    end

    private

    def mark_completed(insight, result)
      insight.update!(
        status: "completed",
        result_payload: {
          sections: result.sections,
          stats: result.stats,
          raw_text: result.raw_text
        },
        content: result.content,
        result_model: result.model,
        prompt_tokens: result.usage&.fetch(:prompt_tokens, nil),
        completion_tokens: result.usage&.fetch(:completion_tokens, nil),
        completed_at: Time.current,
        error_message: nil
      )
    end

    def mark_failed(insight, error_message)
      insight.update!(
        status: "failed",
        error_message: error_message,
        completed_at: nil
      )
    end
  end
end
