# frozen_string_literal: true

require "rails_helper"

RSpec.describe Entry, type: :model do
  describe "validations" do
    it "has a valid factory" do
      expect(build(:entry)).to be_valid
    end

    it "requires a body" do
      entry = build(:entry, body: "")

      expect(entry).not_to be_valid
      expect(entry.errors[:body]).to include("can't be blank")
    end

    it "limits body length" do
      entry = build(:entry, body: "a" * (Entry::MAX_BODY_LENGTH + 1))

      expect(entry).not_to be_valid
      expect(entry.errors[:body]).to include("is too long (maximum is #{Entry::MAX_BODY_LENGTH} characters)")
    end

    it "defaults logged_at before validation" do
      entry = build(:entry, logged_at: nil)
      expect { entry.valid? }.to change(entry, :logged_at).from(nil)
    end
  end

  describe ".recent_first" do
    it "orders entries by logged_at descending" do
      older = create(:entry, logged_at: 2.days.ago)
      newer = create(:entry, logged_at: 1.day.ago)

      expect(described_class.recent_first).to eq([newer, older])
    end
  end
end
