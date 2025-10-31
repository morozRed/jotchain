# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "noreply@notifications.jotchain.com"
  layout "mailer"
end
