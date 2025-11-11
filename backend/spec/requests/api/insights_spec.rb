# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Insights", type: :request do
  describe "GET /preview" do
    it "returns entries when filtering by both project and person" do
      user = create(:user)
      project = create(:project, user:)
      person = create(:person, user:)
      entry = create(:entry, user:, logged_at: Time.current)

      EntryMention.create!(entry:, mentionable: project)
      EntryMention.create!(entry:, mentionable: person)

      sign_in_as user

      get preview_api_insights_path, params: {
        date_range_start: 2.days.ago.iso8601,
        date_range_end: Time.current.iso8601,
        project_ids: [project.id],
        person_ids: [person.id]
      }

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body["totalNotes"]).to eq(1)
    end
  end
end
