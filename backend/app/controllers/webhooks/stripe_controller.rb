# frozen_string_literal: true

module Webhooks
  class StripeController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def create
      payload = request.body.read
      sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
      webhook_secret = ENV.fetch("STRIPE_WEBHOOK_SECRET")

      begin
        event = Stripe::Webhook.construct_event(payload, sig_header, webhook_secret)
      rescue JSON::ParserError, Stripe::SignatureVerificationError => e
        Rails.logger.error("Stripe webhook error: #{e.message}")
        return head :bad_request
      end

      case event.type
      when "customer.subscription.created", "customer.subscription.updated"
        handle_subscription_change(event.data.object)
      when "customer.subscription.deleted"
        handle_subscription_deleted(event.data.object)
      when "customer.subscription.trial_will_end"
        handle_trial_will_end(event.data.object)
      when "invoice.payment_failed"
        handle_payment_failed(event.data.object)
      end

      head :ok
    end

    private

    def handle_subscription_change(stripe_subscription)
      user = StripeService::SubscriptionService.sync_from_stripe(stripe_subscription)
      return unless user

      # Send welcome email when subscription becomes active (after payment is processed)
      # This happens either:
      # 1. User subscribes without a trial (trial_end is nil)
      # 2. User's trial just ended and subscription became active (trial_end is in the past)
      if stripe_subscription.status == "active"
        # Check if this is the first time becoming active
        # Don't send if trial_end is in the future (shouldn't happen, but safety check)
        if stripe_subscription.trial_end.nil? || Time.at(stripe_subscription.trial_end) <= Time.current
          SubscriptionMailer.subscription_started_email(user).deliver_later
        end
      end
    end

    def handle_subscription_deleted(stripe_subscription)
      user = User.find_by(stripe_subscription_id: stripe_subscription.id)
      return unless user

      user.update!(
        subscription_status: "canceled",
        stripe_subscription_id: nil
      )

      SubscriptionMailer.subscription_canceled_email(user).deliver_later
    end

    def handle_trial_will_end(stripe_subscription)
      user = User.find_by(stripe_customer_id: stripe_subscription.customer)
      return unless user

      # Stripe sends this event 3 days before trial ends
      # We can send a reminder email here if needed
      # For now, log it - the trial_ended_email job will handle the actual end
      Rails.logger.info("Trial will end soon for user #{user.id}")

      # Optional: Send a "trial ending soon" email
      # SubscriptionMailer.trial_ending_soon_email(user).deliver_later
    end

    def handle_payment_failed(invoice)
      user = User.find_by(stripe_customer_id: invoice.customer)
      return unless user

      Rails.logger.warn("Payment failed for user #{user.id}")
      # Could send a payment failed email here if needed
    end
  end
end
