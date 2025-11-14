# frozen_string_literal: true

module Datafast
  class Goals < Base
    MAX_METADATA_FIELDS = 10
    MAX_VALUE_LENGTH = 255

    # Common cross-product milestones. Payments should be tracked via the
    # dedicated DataFast revenue attribution guides instead of manual goals.
    SIGN_UP = "sign_up"
    INITIATE_CHECKOUT = "initiate_checkout"

    class << self
      def track(**kwargs)
        new.track(**kwargs)
      end

      def track!(**kwargs)
        new.track!(**kwargs)
      end

      def sign_up(visitor_id:, metadata: nil)
        track(visitor_id:, name: SIGN_UP, metadata:)
      end

      def checkout_initiated(visitor_id:, metadata: nil)
        track(visitor_id:, name: INITIATE_CHECKOUT, metadata:)
      end

      def cta_clicked(visitor_id:, metadata: nil)
        track(visitor_id:, name: CTA_CLICKED, metadata:)
      end

      def newsletter_subscribed(visitor_id:, metadata: nil)
        track(visitor_id:, name: NEWSLETTER_SUBSCRIBE, metadata:)
      end

      def free_trial_started(visitor_id:, metadata: nil)
        track(visitor_id:, name: FREE_TRIAL_STARTED, metadata:)
      end
    end

    def track(visitor_id:, name:, metadata: nil)
      track!(visitor_id:, name:, metadata:)
    rescue Error, ArgumentError => e
      logger.warn("[Datafast::Goals] #{e.message}")
      false
    end

    def track!(visitor_id:, name:, metadata: nil)
      validate_arguments!(visitor_id:, name:)

      payload = {
        datafast_visitor_id: visitor_id.to_s,
        name: format_goal_name(name)
      }

      sanitized_metadata = sanitize_metadata(metadata)
      payload[:metadata] = sanitized_metadata if sanitized_metadata.present?

      request(method: :post, path: "/goals", body: payload)
    end

    private

    def validate_arguments!(visitor_id:, name:)
      raise ArgumentError, "visitor_id is required" if visitor_id.blank?
      raise ArgumentError, "name is required" if name.blank?
    end

    def format_goal_name(name)
      name.to_s.strip.downcase
    end

    def sanitize_metadata(metadata)
      return if metadata.blank?

      result = {}

      metadata.to_h.each do |key, value|
        next if key.blank? || value.nil?

        result[key.to_s] = value.to_s[0, MAX_VALUE_LENGTH]

        break if result.size >= MAX_METADATA_FIELDS
      end

      result.presence
    end
  end
end

