# frozen_string_literal: true

class SummaryMailer < ApplicationMailer
  helper :application
  helper SummaryMailerHelper

  def digest
    @delivery = params.fetch(:delivery)
    @user = @delivery.user
    @schedule = @delivery.notification_schedule
    @payload = (@delivery.summary_payload || {}).deep_stringify_keys
    @sections = Array(@payload["sections"])
    @stats = @payload["stats"]
    @window = @payload["window"] || {
      "start" => @delivery.window_start,
      "end" => @delivery.window_end
    }
    @source_entries = Array(@payload["source_entries"])
    @header_tagline = @schedule.name
    @footer_manage_link = manage_notifications_url

    mail(
      to: @user.email,
      subject: subject_line
    )
  end

  private

  def subject_line
    window_end = time_zone_local(@delivery.window_end)
    "JotChain | Summary ready: #{window_end.strftime('%b %-d')}"
  rescue StandardError
    "Your Jotchain summary"
  end

  def manage_notifications_url
    notifications_url(**default_url_options)
  rescue StandardError
    nil
  end

  def time_zone_local(time)
    zone = @schedule.inferred_time_zone
    time.in_time_zone(zone)
  end
end
