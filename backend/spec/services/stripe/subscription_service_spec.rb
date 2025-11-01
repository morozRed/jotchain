# frozen_string_literal: true

require "rails_helper"

RSpec.describe StripeService::SubscriptionService do
  describe ".cancel" do
    let(:user) do
      create(
        :user,
        stripe_subscription_id: "sub_123",
        stripe_customer_id: "cus_456",
        cancel_at_period_end: false
      )
    end
    let(:stripe_subscription) { double(cancel_at_period_end: true) }

    it "updates the local cancel flag after canceling in Stripe" do
      expect(Stripe::Subscription).to receive(:update)
        .with("sub_123", cancel_at_period_end: true)
        .and_return(stripe_subscription)

      described_class.cancel(user)

      expect(user.reload.cancel_at_period_end).to eq(true)
    end
  end

  describe ".reactivate" do
    let(:user) do
      create(
        :user,
        stripe_subscription_id: "sub_789",
        stripe_customer_id: "cus_987",
        cancel_at_period_end: true
      )
    end
    let(:reactivated_subscription) { double(cancel_at_period_end: false) }

    it "clears the local cancel flag after reactivating in Stripe" do
      expect(Stripe::Subscription).to receive(:update)
        .with("sub_789", cancel_at_period_end: false)
        .and_return(reactivated_subscription)

      described_class.reactivate(user)

      expect(user.reload.cancel_at_period_end).to eq(false)
    end
  end

  describe ".create_customer_portal_session" do
    let(:customer_id) { "cus_123" }
    let(:return_url) { "https://example.com/billing" }

    it "passes the configured billing portal configuration when present" do
      original_configuration = ENV["STRIPE_BILLING_PORTAL_CONFIGURATION"]
      ENV["STRIPE_BILLING_PORTAL_CONFIGURATION"] = "bpc_123"

      expect(Stripe::BillingPortal::Session).to receive(:create)
        .with(hash_including(customer: customer_id, return_url: return_url, configuration: "bpc_123"))
        .and_return(double(url: "https://portal.example.com"))

      described_class.create_customer_portal_session(customer_id: customer_id, return_url: return_url)
    ensure
      ENV["STRIPE_BILLING_PORTAL_CONFIGURATION"] = original_configuration
    end

    it "raises a helpful error when Stripe reports a missing configuration" do
      allow(Stripe::BillingPortal::Session).to receive(:create).and_raise(
        Stripe::InvalidRequestError.new(
          "No configuration provided and your test mode default configuration has not been created.",
          nil
        )
      )

      expect do
        described_class.create_customer_portal_session(customer_id: customer_id, return_url: return_url)
      end.to raise_error(described_class::MissingBillingPortalConfigurationError)
    end
  end
end
