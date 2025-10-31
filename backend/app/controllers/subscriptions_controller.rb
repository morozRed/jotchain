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

    session = StripeService::CheckoutService.create_session(
      user: Current.user,
      price_id: price_id,
      success_url: billing_success_url,
      cancel_url: billing_path
    )

    redirect_to session.url, allow_other_host: true
  end

  def success
    redirect_to billing_path, notice: "Subscription activated! Welcome aboard."
  end

  def customer_portal
    return redirect_to billing_path, alert: "No subscription found" unless Current.user.stripe_customer_id.present?

    portal_session = StripeService::SubscriptionService.create_customer_portal_session(
      customer_id: Current.user.stripe_customer_id,
      return_url: billing_path
    )

    redirect_to portal_session.url, allow_other_host: true
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
      trialExpired: user.trial_expired?
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
