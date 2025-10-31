# frozen_string_literal: true

Rails.configuration.to_prepare do
  Stripe.api_key = ENV.fetch("STRIPE_SECRET_KEY", "")
  Stripe.api_version = "2024-12-18.acacia"
end
