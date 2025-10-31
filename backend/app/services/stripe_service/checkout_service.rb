# frozen_string_literal: true

module StripeService
  class CheckoutService
    def self.create_session(user:, price_id:, success_url:, cancel_url:)
      customer = CustomerService.find_or_create(user)

      # Calculate remaining trial days
      remaining_trial_days = calculate_remaining_trial_days(user)

      session_params = {
        customer: customer.id,
        mode: "subscription",
        line_items: [
          {
            price: price_id,
            quantity: 1
          }
        ],
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: {
          user_id: user.id
        },
        subscription_data: {
          metadata: {
            user_id: user.id
          }
        }
      }

      # Add trial period if user still has trial time remaining
      if remaining_trial_days > 0
        session_params[:subscription_data][:trial_period_days] = remaining_trial_days
      end

      Stripe::Checkout::Session.create(session_params)
    end

    def self.calculate_remaining_trial_days(user)
      # Only calculate remaining days if user has an active trial
      return 0 unless user.trial_active?

      # Calculate days remaining from today until trial ends
      days_remaining = ((user.trial_ends_at.to_date - Date.today).to_i)

      # Ensure we don't return negative days
      [days_remaining, 0].max
    end
  end
end
