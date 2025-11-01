# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "hey@notifications.jotchain.com"
  layout "mailer"
end
