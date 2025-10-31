# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserMailer, type: :mailer do
  describe "welcome" do
    subject(:mail) { UserMailer.with(user:).welcome }

    let(:user) { build(:user) }

    it "renders the headers" do
      expect(mail.subject).to eq("Welcome to Jotchain")
      expect(mail.to).to eq([user.email])
    end
  end

  describe "password_reset" do
    subject(:mail) { UserMailer.with(user:).password_reset }

    let(:user) { build(:user) }

    it "renders the headers" do
      expect(mail.subject).to eq("Reset your password")
      expect(mail.to).to eq([user.email])
    end
  end

  describe "email_verification" do
    subject(:mail) { UserMailer.with(user:).email_verification }

    let(:user) { build(:user) }

    it "renders the headers" do
      expect(mail.subject).to eq("Verify your email")
      expect(mail.to).to eq([user.email])
    end
  end
end
