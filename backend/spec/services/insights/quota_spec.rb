# frozen_string_literal: true

require "rails_helper"

RSpec.describe Insights::Quota do
  subject(:quota) { described_class.new(user:) }

  let(:user) { create(:user) }

  around do |example|
    travel_to(Time.zone.local(2024, 1, 15, 12, 0, 0)) { example.run }
  end

  describe "#monthly_limit" do
    it "returns the default monthly limit" do
      expect(quota.monthly_limit).to eq(described_class::DEFAULT_MONTHLY_LIMIT)
    end
  end

  describe "#monthly_usage" do
    it "counts insight requests created during the current month" do
      create_list(:insight_request, 3, user:, created_at: Time.zone.local(2024, 1, 5))
      create(:insight_request, user:, created_at: Time.zone.local(2023, 12, 15))

      expect(quota.monthly_usage).to eq(3)
    end

    it "includes soft-deleted insight requests" do
      insight = create(:insight_request, user:, created_at: Time.zone.local(2024, 1, 5))
      insight.update!(deleted_at: Time.zone.local(2024, 1, 10))

      expect(quota.monthly_usage).to eq(1)
    end
  end

  describe "#remaining" do
    it "subtracts usage from the limit" do
      create_list(:insight_request, 7, user:, created_at: Time.zone.local(2024, 1, 6))

      expect(quota.remaining).to eq(described_class::DEFAULT_MONTHLY_LIMIT - 7)
    end
  end

  describe "#limit_reached?" do
    it "is true when usage meets or exceeds the limit" do
      create_list(:insight_request, described_class::DEFAULT_MONTHLY_LIMIT, user:, created_at: Time.zone.local(2024, 1, 10))

      expect(quota.limit_reached?).to be(true)
    end

    it "is false when usage is below the limit" do
      create_list(:insight_request, 2, user:, created_at: Time.zone.local(2024, 1, 2))

      expect(quota.limit_reached?).to be(false)
    end
  end
end

