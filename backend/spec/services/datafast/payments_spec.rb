# frozen_string_literal: true

require "rails_helper"

RSpec.describe Datafast::Payments do
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
      body: {message: "Payment recorded", transaction_id: "txn_123"}.to_json
    )
  end

  describe "#create" do
    it "sends the payment payload to DataFast" do
      payload = {
        amount: 29.99,
        currency: "usd",
        transaction_id: "txn_123",
        datafast_visitor_id: "visitor-1",
        email: "user@example.com",
        renewal: true
      }

      expect(http_client).to receive(:post).with(
        "#{base_url}/payments",
        hash_including(
          body: {
            amount: 29.99,
            currency: "USD",
            transaction_id: "txn_123",
            datafast_visitor_id: "visitor-1",
            email: "user@example.com",
            renewal: true
          }.to_json
        )
      ).and_return(success_response)

      result = service.create(**payload)
      expect(result).to eq(message: "Payment recorded", transaction_id: "txn_123")
    end

    it "returns false and logs when the API returns an error" do
      error_response = instance_double(
        HTTParty::Response,
        code: 422,
        body: {error: {message: "invalid payment"}}.to_json
      )

      allow(http_client).to receive(:post).and_return(error_response)

      expect(logger).to receive(:warn).with(/invalid payment/)

      expect(
        service.create(amount: 10, currency: "usd", transaction_id: "bad")
      ).to be(false)
    end
  end

  describe "#create!" do
    it "raises an error when amount is negative" do
      expect do
        service.create!(amount: -1, currency: "usd", transaction_id: "txn")
      end.to raise_error(ArgumentError)
    end

    it "raises an error when the API key is missing" do
      unconfigured = described_class.new(
        api_key: nil,
        base_url:,
        http_client:,
        logger:
      )

      expect do
        unconfigured.create!(amount: 10, currency: "usd", transaction_id: "txn")
      end.to raise_error(Datafast::Base::ConfigurationError)
    end
  end
end

