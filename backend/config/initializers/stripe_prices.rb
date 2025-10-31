# frozen_string_literal: true

# Load Stripe prices on app boot
Rails.application.config.after_initialize do
  next unless Rails.env.production? || Rails.env.development?

  begin
    StripeService::PriceService.load_prices
    Rails.logger.info("Stripe prices loaded and cached")
  rescue => e
    Rails.logger.error("Failed to load Stripe prices on boot: #{e.message}")
  end
end
