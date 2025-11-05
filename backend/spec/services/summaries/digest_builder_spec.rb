# frozen_string_literal: true

require "rails_helper"

RSpec.describe Summaries::DigestBuilder do
  describe "formatted entries use body_text" do
    it "does not leak TipTap JSON into the notes list" do
      user = create(:user)

      tiptap_json = {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Alpha Beta" }] }
        ]
      }.to_json

      entry = create(:entry, user:, body: tiptap_json, body_format: "tiptap", logged_at: Time.zone.parse("2025-01-01 10:15"))

      builder = described_class.new(user:, window: { start: entry.logged_at.beginning_of_day, end: entry.logged_at.end_of_day })

      formatted = builder.send(:formatted_entries, user.entries)

      expect(formatted).to include("Alpha Beta")
      expect(formatted).not_to include("\"text\":\"Alpha Beta\"")
      expect(formatted).not_to include("\"type\":\"doc\"")
    end
  end
end

