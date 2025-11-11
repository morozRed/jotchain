# frozen_string_literal: true

require "rails_helper"

RSpec.describe Insights::Generator do
  describe "#call" do
    it "returns entries when filtering by both project and person" do
      user = create(:user)
      project = create(:project, user:)
      person = create(:person, user:)
      entry = create(:entry, user:, logged_at: Time.current)

      EntryMention.create!(entry:, mentionable: project)
      EntryMention.create!(entry:, mentionable: person)

      insight_request = create(
        :insight_request,
        user:,
        project_ids: [project.id],
        person_ids: [person.id],
        date_range_start: 2.days.ago,
        date_range_end: Time.current
      )

      fake_ai_client = Class.new do
        Response = Struct.new(:text, :model, :usage)

        def self.call!(**)
          Response.new(
            {sections: [{title: "Summary", bullets: ["Progress"]}]}.to_json,
            "test-model",
            {input_tokens: 0, output_tokens: 0}
          )
        end
      end

      result = described_class.new(user:, insight_request:, ai_client: fake_ai_client).call

      expect(result).to be_ok
      expect(result.stats[:total_entries]).to eq(1)
    end
  end
end
