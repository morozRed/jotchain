# frozen_string_literal: true

require 'stripe'

# Configure Stripe API
Rails.configuration.stripe = {
  publishable_key: ENV['STRIPE_PUBLISHABLE_KEY'] || Rails.application.credentials.dig(:stripe, :publishable_key),
  secret_key: ENV['STRIPE_SECRET_KEY'] || Rails.application.credentials.dig(:stripe, :secret_key),
  webhook_secret: ENV['STRIPE_WEBHOOK_SECRET'] || Rails.application.credentials.dig(:stripe, :webhook_secret),
  price_ids: {
    monthly: ENV['STRIPE_MONTHLY_PRICE_ID'] || Rails.application.credentials.dig(:stripe, :price_ids, :monthly),
    yearly: ENV['STRIPE_YEARLY_PRICE_ID'] || Rails.application.credentials.dig(:stripe, :price_ids, :yearly)
  }
}

Stripe.api_key = Rails.configuration.stripe[:secret_key]
Stripe.api_version = '2024-09-30.acacia'

# Log Stripe configuration status (without exposing keys)
Rails.logger.info "Stripe initialized with API version: #{Stripe.api_version}"
Rails.logger.info "Stripe publishable key configured: #{Rails.configuration.stripe[:publishable_key].present?}"
Rails.logger.info "Stripe secret key configured: #{Rails.configuration.stripe[:secret_key].present?}"