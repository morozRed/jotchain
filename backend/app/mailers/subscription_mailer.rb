# frozen_string_literal: true

class SubscriptionMailer < ApplicationMailer
  def subscription_started_email(user)
    @user = user
    @plan_name = user.plan_type == "monthly" ? "Monthly Pro" : "Yearly Pro"
    @billing_url = billing_url

    mail(
      to: @user.email,
      subject: "Welcome to Jotchain Pro! 🎉"
    )
  end

  def subscription_canceled_email(user)
    @user = user
    @billing_url = billing_url

    mail(
      to: @user.email,
      subject: "Your Jotchain subscription has been canceled"
    )
  end

  def trial_ended_email(user)
    @user = user
    @billing_url = billing_url

    mail(
      to: @user.email,
      subject: "Your Jotchain trial has ended"
    )
  end

  def trial_reminder_email(user)
    @user = user
    @billing_url = billing_url

    mail(
      to: @user.email,
      subject: "We miss you at Jotchain"
    )
  end

  private

  def billing_url
    Rails.application.routes.url_helpers.billing_url(**default_url_options)
  rescue StandardError
    nil
  end
end
