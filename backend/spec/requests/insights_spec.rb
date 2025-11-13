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
  end
end

