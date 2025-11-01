# frozen_string_literal: true

class SubscriptionsController < InertiaController
  def index
    render inertia: "billing/index", props: {
      subscription: subscription_payload,
      plans: plans_payload
    }
  end

  def create_checkout_session
    plan_type = params[:plan_type]

    price_id = case plan_type
    when "monthly"
      ENV.fetch("STRIPE_MONTHLY_PRICE_ID")
    when "yearly"
      ENV.fetch("STRIPE_YEARLY_PRICE_ID")
    else
      return redirect_to billing_path, alert: "Invalid plan type"
    end

    user = Current.user

    # SAFETY CHECK: Prevent creating multiple subscriptions
    if user.stripe_subscription_id.present? && (user.active_subscription? || user.trial_active?)
      # User already has an active subscription
      # Check if they're trying to subscribe to the same plan
      if user.plan_type == plan_type
        # Same plan - check if it's canceled
        if user.cancel_at_period_end
          # Redirect to reactivate instead
          return redirect_to billing_path, alert: "You already have this plan scheduled for cancellation. Please reactivate it instead."
        else
          # Already on this plan and it's active
          return redirect_to billing_path, alert: "You're already subscribed to this plan."
        end
      else
        # Different plan - redirect to switch plan
        return redirect_to billing_path, alert: "Please use the 'Switch Plan' button to change your subscription."
      end
    end

    # If we get here, user has no active subscription - proceed with checkout
    session = StripeService::CheckoutService.create_session(
      user: user,
      price_id: price_id,
      success_url: billing_success_url,
      cancel_url: billing_url
    )

    # Return the Stripe URL to the frontend for client-side navigation
    render inertia: "billing/index", props: {
      subscription: subscription_payload,
      plans: plans_payload,
      checkout_url: session.url
    }
  end

  def success
    redirect_to billing_path, notice: "Subscription activated! Welcome aboard."
  end

  def customer_portal
    return redirect_to billing_path, alert: "No subscription found" unless Current.user.stripe_customer_id.present?

    portal_session = StripeService::SubscriptionService.create_customer_portal_session(
      customer_id: Current.user.stripe_customer_id,
      return_url: billing_url
    )

    # Return the portal URL to the frontend for client-side navigation
    render inertia: "billing/index", props: {
      subscription: subscription_payload,
      plans: plans_payload,
      portal_url: portal_session.url
    }
  rescue StripeService::SubscriptionService::MissingBillingPortalConfigurationError => e
    redirect_to billing_path, alert: e.message
  rescue Stripe::InvalidRequestError => e
    Rails.logger.error("[Stripe] Billing portal session failed: #{e.message}")
    redirect_to billing_path, alert: "We couldn't open the billing portal right now. Please try again shortly."
  end

  def cancel
    unless Current.user.stripe_subscription_id.present?
      return redirect_to billing_path, alert: "No active subscription found"
    end

    if Current.user.cancel_at_period_end
      return redirect_to billing_path, alert: "Your subscription is already scheduled to cancel"
    end

    StripeService::SubscriptionService.cancel(Current.user)
    redirect_to billing_path, notice: "Your subscription will be canceled at the end of the billing period. You'll keep access until then."
  end

  def reactivate
    unless Current.user.stripe_subscription_id.present?
      return redirect_to billing_path, alert: "No subscription found"
    end

    unless Current.user.cancel_at_period_end
      return redirect_to billing_path, alert: "No pending cancellation found"
    end

    StripeService::SubscriptionService.reactivate(Current.user)
    redirect_to billing_path, notice: "Your subscription has been reactivated!"
  end

  def switch_plan
    plan_type = params[:plan_type]

    # Validate plan type
    price_id = case plan_type
    when "monthly"
      ENV.fetch("STRIPE_MONTHLY_PRICE_ID")
    when "yearly"
      ENV.fetch("STRIPE_YEARLY_PRICE_ID")
    else
      return redirect_to billing_path, alert: "Invalid plan type"
    end

    user = Current.user

    # Ensure user has a subscription to switch
    unless user.stripe_subscription_id.present?
      return redirect_to billing_path, alert: "No subscription found to switch"
    end

    # Check if already on this plan (and not canceled)
    if user.plan_type == plan_type && !user.cancel_at_period_end
      return redirect_to billing_path, alert: "You're already on the #{plan_type} plan"
    end

    begin
      StripeService::SubscriptionService.switch_plan(
        user: user,
        new_price_id: price_id
      )

      redirect_to billing_path, notice: "Successfully switched to #{plan_type} plan!"
    rescue Stripe::StripeError => e
      Rails.logger.error("[Stripe] Plan switch failed: #{e.message}")
      redirect_to billing_path, alert: "Failed to switch plans. Please try again or contact support."
    end
  end

  private

  def subscription_payload
    user = Current.user

    {
      status: user.subscription_status,
      planType: user.plan_type,
      trialEndsAt: user.trial_ends_at&.iso8601,
      currentPeriodEnd: user.current_period_end&.iso8601,
      daysLeftInTrial: user.days_left_in_trial,
      activeSubscription: user.active_subscription?,
      trialActive: user.trial_active?,
      trialExpired: user.trial_expired?,
      cancelAtPeriodEnd: user.cancel_at_period_end
    }
  end

  def plans_payload
    prices = StripeService::PriceService.get_prices
    monthly = prices[:monthly]
    yearly = prices[:yearly]

    monthly_amount = monthly[:amount].to_i
    yearly_amount = yearly[:amount].to_i
    savings = (monthly_amount * 12) - yearly_amount

    [
      {
        id: "monthly",
        name: "Monthly Pro",
        price: "$#{monthly_amount}",
        interval: monthly[:interval],
        features: [
          "Unlimited journal entries",
          "Unlimited AI summaries",
          "Unlimited notification schedules",
          "Email notifications"
        ]
      },
      {
        id: "yearly",
        name: "Yearly Pro",
        price: "$#{yearly_amount}",
        interval: yearly[:interval],
        savings: savings > 0 ? "Save $#{savings}" : nil,
        features: [
          "Unlimited journal entries",
          "Unlimited AI summaries",
          "Unlimited notification schedules",
          "Email notifications"
        ]
      }
    ]
  end
end
