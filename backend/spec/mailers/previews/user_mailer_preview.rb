# frozen_string_literal: true

require_relative "preview_data"

class UserMailerPreview < ActionMailer::Preview
  include PreviewData

  def welcome
    UserMailer.with(user: preview_user).welcome
  end

  def email_verification
    UserMailer.with(user: preview_user).email_verification
  end

  def password_reset
    UserMailer.with(user: preview_user).password_reset
  end
end
