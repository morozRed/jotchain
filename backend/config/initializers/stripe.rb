# frozen_string_literal: true

Rails.configuration.to_prepare do
  Stripe.api_key = ENV.fetch("STRIPE_SECRET_KEY", "")
  Stripe.api_version = "2025-09-30.clover"
end
