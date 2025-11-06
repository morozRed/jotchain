# frozen_string_literal: true

module SummaryMailerHelper
  def formatted_window(window)
    start_time = parse_time(window["start"] || window[:start])
    end_time = parse_time(window["end"] || window[:end])
    zone = schedule_zone

    if start_time && end_time
      "#{start_time.in_time_zone(zone).strftime('%b %-d %H:%M')} – #{end_time.in_time_zone(zone).strftime('%b %-d %H:%M %Z')}"
    elsif end_time
      end_time.in_time_zone(zone).strftime("%b %-d %H:%M %Z")
    else
      "recent activity"
    end
  end

  def digest_cta_url
    dashboard_url(**default_url_options)
  rescue StandardError
    "#"
  end

  def format_streak(streak)
    return "0" if streak.nil? || streak.zero?
    streak.to_s
  end

  def format_streak_label(streak)
    return "Day streak" if streak.nil? || streak == 1
    "Days streak"
  end

  def format_most_productive_day(day_name)
    day_name || "—"
  end

  def format_total_notes(count)
    count&.to_s || "0"
  end

  def sections_by_project(sections)
    # Group sections by project name
    # If a section has no project, group under "General"
    sections.group_by do |section|
      project = section["project"] || section[:project]
      project.present? ? (project["name"] || project[:name]) : "General"
    end
  end

  def format_collaborators(collaborators)
    return "" if collaborators.blank?

    names = collaborators.map { |c| c["name"] || c[:name] }
    case names.length
    when 1
      names.first
    when 2
      "#{names[0]} and #{names[1]}"
    when 3
      "#{names[0]}, #{names[1]}, and #{names[2]}"
    else
      "#{names[0]}, #{names[1]}, and #{names.length - 2} others"
    end
  end

  private

  def parse_time(value)
    case value
    when Time
      value
    when String
      Time.zone.parse(value)
    else
      nil
    end
  end

  def schedule_zone
    @schedule&.inferred_time_zone || Time.zone || ActiveSupport::TimeZone["UTC"]
  end
end
