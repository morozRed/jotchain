# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "JotChain <grig@notifications.jotchain.com>"
  layout "mailer"
end
