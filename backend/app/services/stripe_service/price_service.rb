# frozen_string_literal: true

module StripeService
  class PriceService
    CACHE_KEY = "stripe_pricing_data"
    CACHE_TTL = 1.second

    def self.load_prices
      # Fetch from Stripe and cache
      monthly_price = fetch_stripe_price(ENV.fetch("STRIPE_MONTHLY_PRICE_ID"))
      yearly_price = fetch_stripe_price(ENV.fetch("STRIPE_YEARLY_PRICE_ID"))

      pricing_data = {
        monthly: format_price_data(monthly_price, "monthly"),
        yearly: format_price_data(yearly_price, "yearly")
      }

      Rails.cache.write(CACHE_KEY, pricing_data, expires_in: CACHE_TTL)
      pricing_data
    end

    def self.get_prices
      load_prices
    end

    private

    def self.fetch_stripe_price(price_id)
      Stripe::Price.retrieve(price_id)
    rescue => e
      Rails.logger.error("Failed to fetch Stripe price: #{e.message}")
      nil
    end

    def self.format_price_data(stripe_price, plan_type)
      return fallback_price(plan_type) unless stripe_price

      {
        amount: stripe_price.unit_amount / 100.0,
        currency: stripe_price.currency,
        interval: stripe_price.recurring.interval
      }
    end

    def self.fallback_price(plan_type)
      plan_type == "monthly" ?
        {amount: 9, currency: "usd", interval: "month"} :
        {amount: 90, currency: "usd", interval: "year"}
    end
  end
end
