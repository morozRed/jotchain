# frozen_string_literal: true

module StripeService
  class SubscriptionService
    class MissingBillingPortalConfigurationError < StandardError; end

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
        trial_ends_at: stripe_subscription.trial_end ? Time.at(stripe_subscription.trial_end) : nil,
        cancel_at_period_end: stripe_subscription.cancel_at_period_end || false
      )

      user
    end

    def self.cancel(user)
      return unless user.stripe_subscription_id.present?

      subscription = Stripe::Subscription.update(
        user.stripe_subscription_id,
        { cancel_at_period_end: true }
      )

      user.update!(
        cancel_at_period_end: subscription.cancel_at_period_end
      )

      subscription
    end

    def self.reactivate(user)
      return unless user.stripe_subscription_id.present?
      return unless user.cancel_at_period_end

      subscription = Stripe::Subscription.update(
        user.stripe_subscription_id,
        { cancel_at_period_end: false }
      )

      user.update!(
        cancel_at_period_end: subscription.cancel_at_period_end
      )

      subscription
    end

    def self.switch_plan(user:, new_price_id:)
      return unless user.stripe_subscription_id.present?

      # Retrieve the subscription to get the item ID
      subscription = Stripe::Subscription.retrieve(user.stripe_subscription_id)
      subscription_item_id = subscription.items.data.first.id

      # Update the subscription with new price
      # Also clear cancel_at_period_end if it was set
      updated_subscription = Stripe::Subscription.update(
        user.stripe_subscription_id,
        {
          items: [
            {
              id: subscription_item_id,
              price: new_price_id
            }
          ],
          cancel_at_period_end: false,
          proration_behavior: "create_prorations"
        }
      )

      # Sync the updated subscription back to the user record
      sync_from_stripe(updated_subscription)
    end

    def self.retrieve(subscription_id)
      Stripe::Subscription.retrieve(subscription_id)
    end

    def self.create_customer_portal_session(customer_id:, return_url:)
      configuration_id = ENV["STRIPE_BILLING_PORTAL_CONFIGURATION"]

      params = {
        customer: customer_id,
        return_url: return_url
      }

      params[:configuration] = configuration_id if configuration_id.present?

      Stripe::BillingPortal::Session.create(params)
    rescue Stripe::InvalidRequestError => e
      if configuration_id.blank? && e.message.include?("No configuration provided")
        raise MissingBillingPortalConfigurationError,
          "Stripe billing portal configuration is missing. Create a configuration in your Stripe dashboard and set STRIPE_BILLING_PORTAL_CONFIGURATION."
      end

      raise
    end
  end
end
