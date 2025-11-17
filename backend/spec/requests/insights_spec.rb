# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Insights", type: :request do
  describe "POST /insights" do
    let(:user) { create(:user) }
    let(:params) do
      {
        insight_request: {
          query_type: "summary",
          date_range_start: 2.weeks.ago.iso8601,
          date_range_end: Time.current.iso8601,
          project_ids: [],
          person_ids: []
        }
      }
    end

    before do
      sign_in_as(user)
      allow(Insights::GenerateJob).to receive(:perform_later)
    end

    it "creates an insight request when under the monthly quota" do
      expect do
        post insights_path, params: params
      end.to change { user.insight_requests.count }.by(1)

      expect(response).to have_http_status(:ok)
    end

    it "returns an error when the monthly quota has been reached" do
      travel_to(Time.zone.local(2024, 1, 10)) do
        create_list(
          :insight_request,
          Insights::Quota::DEFAULT_MONTHLY_LIMIT,
          user:,
          created_at: Time.zone.local(2024, 1, 5)
        )

        expect do
          post insights_path, params: params
        end.not_to change { user.insight_requests.count }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["error"]).to include("monthly AI generation limit")
      end
    end

    context "when the trial has expired" do
      let(:user) { create(:user, subscription_status: "trialing", trial_ends_at: 2.days.ago) }

      it "blocks insight creation" do
        expect do
          post insights_path, params: params
        end.not_to change { user.insight_requests.count }

        expect(response).to have_http_status(:payment_required)
        body = JSON.parse(response.body)
        expect(body["error"]).to include("trial has ended")
      end
    end
  end

  describe "DELETE /insights/:id" do
    let(:user) { create(:user) }
    let!(:insight) { create(:insight_request, user:) }

    before { sign_in_as(user) }

    it "soft deletes the insight request" do
      delete insight_path(insight)

      expect(response).to redirect_to(insights_path)
      expect(insight.reload.deleted_at).to be_present
    end

    it "does not change the monthly quota usage" do
      quota_before = Insights::Quota.new(user:).monthly_usage

      delete insight_path(insight)

      expect(Insights::Quota.new(user:).monthly_usage).to eq(quota_before)
    end
  end
end

