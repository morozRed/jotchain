# frozen_string_literal: true

module StripeService
  class SubscriptionService
    def self.sync_from_stripe(stripe_subscription)
      user = User.find_by(stripe_customer_id: stripe_subscription.customer)
      return unless user

      # Determine plan type from price ID
      price_id = stripe_subscription.items.data.first.price.id
      monthly_price_id = ENV["STRIPE_MONTHLY_PRICE_ID"]
      yearly_price_id = ENV["STRIPE_YEARLY_PRICE_ID"]

      plan_type = case price_id
      when monthly_price_id
        "monthly"
      when yearly_price_id
        "yearly"
      else
        "unknown"
      end

      user.update!(
        stripe_subscription_id: stripe_subscription.id,
        subscription_status: stripe_subscription.status,
        plan_type: plan_type,
        current_period_end: Time.at(stripe_subscription.items.data.first.current_period_end),
        trial_ends_at: stripe_subscription.trial_end ? Time.at(stripe_subscription.trial_end) : nil
      )

      user
    end

    def self.cancel(user)
      return unless user.stripe_subscription_id.present?

      Stripe::Subscription.cancel(user.stripe_subscription_id)
    end

    def self.retrieve(subscription_id)
      Stripe::Subscription.retrieve(subscription_id)
    end

    def self.create_customer_portal_session(customer_id:, return_url:)
      Stripe::BillingPortal::Session.create(
        customer: customer_id,
        return_url: return_url
      )
    end
  end
end
