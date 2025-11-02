# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "Grig at JotChain <grig@notifications.jotchain.com>"
  layout "mailer"
end
