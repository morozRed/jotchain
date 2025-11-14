# frozen_string_literal: true

require "rails_helper"

RSpec.describe Datafast::Goals do
  let(:http_client) { class_double(HTTParty) }
  let(:logger) { instance_double(Logger, warn: nil, error: nil) }
  let(:api_key) { "test-api-key" }
  let(:base_url) { "https://api.example.com/v1" }
  let(:service) do
    described_class.new(
      api_key:,
      base_url:,
      http_client:,
      logger:,
      timeout_seconds: 5
    )
  end

  let(:success_response) do
    instance_double(
      HTTParty::Response,
      code: 200,
      body: {status: "success", data: {eventId: "123"}}.to_json
    )
  end

  describe "#track" do
    it "returns false when the service is not configured" do
      unconfigured = described_class.new(
        api_key: nil,
        base_url:,
        http_client:,
        logger:
      )

      expect(http_client).not_to receive(:post)
      expect(unconfigured.track(visitor_id: "vid", name: "signup")).to be(false)
    end

    it "sends a request to DataFast and returns the response body" do
      expected_payload = {
        datafast_visitor_id: "visitor-123",
        name: "signup",
        metadata: {
          "email" => "user@example.com"
        }
      }

      expect(http_client).to receive(:post).with(
        "#{base_url}/goals",
        hash_including(
          headers: {
            "Authorization" => "Bearer #{api_key}",
            "Content-Type" => "application/json"
          },
          body: expected_payload.to_json,
          timeout: 5
        )
      ).and_return(success_response)

      result = service.track(
        visitor_id: "visitor-123",
        name: "Signup",
        metadata: {email: "user@example.com"}
      )

      expect(result).to eq(status: "success", data: {eventId: "123"})
    end

    it "returns false when the API responds with an error" do
      error_response = instance_double(
        HTTParty::Response,
        code: 422,
        body: {error: {message: "invalid goal"}}.to_json
      )

      allow(http_client).to receive(:post).and_return(error_response)

      expect(logger).to receive(:warn).with(/invalid goal/)
      expect(service.track(visitor_id: "visitor", name: "signup")).to be(false)
    end
  end

  describe "#track!" do
    it "raises an error when the API returns an error" do
      error_response = instance_double(
        HTTParty::Response,
        code: 500,
        body: {error: {message: "boom"}}.to_json
      )

      allow(http_client).to receive(:post).and_return(error_response)

      expect do
        service.track!(visitor_id: "visitor", name: "signup")
      end.to raise_error(Datafast::Base::RequestError, /boom/)
    end

    it "raises a configuration error when API key is missing" do
      unconfigured = described_class.new(
        api_key: nil,
        base_url:,
        http_client:,
        logger:
      )

      expect do
        unconfigured.track!(visitor_id: "visitor", name: "signup")
      end.to raise_error(Datafast::Base::ConfigurationError)
    end
  end

  describe ".sign_up" do
    it "delegates to track with the sign_up goal name" do
      expect(described_class).to receive(:track).with(
        visitor_id: "visitor",
        name: described_class::SIGN_UP,
        metadata: {plan: "pro"}
      )

      described_class.sign_up(visitor_id: "visitor", metadata: {plan: "pro"})
    end
  end

  describe ".checkout_initiated" do
    it "delegates to track with the initiate_checkout goal name" do
      expect(described_class).to receive(:track).with(
        visitor_id: "visitor",
        name: described_class::INITIATE_CHECKOUT,
        metadata: {plan: "pro"}
      )

      described_class.checkout_initiated(visitor_id: "visitor", metadata: {plan: "pro"})
    end
  end

  describe ".cta_clicked" do
    it "delegates to track with the cta_clicked goal name" do
      expect(described_class).to receive(:track).with(
        visitor_id: "visitor",
        name: described_class::CTA_CLICKED,
        metadata: {location: "hero"}
      )

      described_class.cta_clicked(visitor_id: "visitor", metadata: {location: "hero"})
    end
  end

  describe ".newsletter_subscribed" do
    it "delegates to track with the newsletter_subscribe goal name" do
      expect(described_class).to receive(:track).with(
        visitor_id: "visitor",
        name: described_class::NEWSLETTER_SUBSCRIBE,
        metadata: {source: "blog"}
      )

      described_class.newsletter_subscribed(visitor_id: "visitor", metadata: {source: "blog"})
    end
  end

  describe ".free_trial_started" do
    it "delegates to track with the free_trial goal name" do
      expect(described_class).to receive(:track).with(
        visitor_id: "visitor",
        name: described_class::FREE_TRIAL_STARTED,
        metadata: {plan: "starter"}
      )

      described_class.free_trial_started(visitor_id: "visitor", metadata: {plan: "starter"})
    end
  end
end

