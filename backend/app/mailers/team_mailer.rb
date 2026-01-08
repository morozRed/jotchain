# frozen_string_literal: true

class TeamMailer < ApplicationMailer
  def weekly_summary(user:, workspace:, summary:)
    @user = user
    @workspace = workspace
    @summary = summary

    mail(
      to: user.email,
      subject: "Weekly Team Summary - #{workspace.name}"
    )
  end

  def stale_pr_alert(user:, workspace:, stale_prs:)
    @user = user
    @workspace = workspace
    @stale_prs = stale_prs

    mail(
      to: user.email,
      subject: "#{stale_prs.count} stale PRs need attention - #{workspace.name}"
    )
  end
end
