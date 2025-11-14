# frozen_string_literal: true

require "digest/md5"

module SeedToolkit
  module_function

  def stable_uuid(key)
    digest = Digest::MD5.hexdigest("jotchain:#{key}")
    [8, 4, 4, 4, 12].map { |len| digest.slice!(0, len) }.join("-")
  end

  def tiptap_body(parts)
    content = parts.compact.map do |part|
      case part[:type]
      when :text
        next if part[:text].blank?

        {type: "text", text: part[:text]}
      when :mention
        record = part[:record]
        next unless record

        {
          type: "mention",
          attrs: {
            id: record.id,
            type: record.is_a?(Project) ? "project" : "person",
            label: record.name
          }
        }
      end
    end.compact

    content = [{type: "text", text: ""}] if content.empty?

    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: content
        }
      ]
    }.to_json
  end

  def time_on(date, hour, min = 0)
    Time.zone.local(date.year, date.month, date.day, hour, min)
  end
end

ActiveRecord::Base.transaction do
  Time.zone = "UTC" if Time.zone.nil?

  user = User.find_or_create_by!(email: "moroz.grigory@gmail.com") do |u|
    u.name = "Grigory Moroz"
    u.password = "securepassword"
    u.password_confirmation = "securepassword"
  end

  user.update!(
    name: "Grigory Moroz",
    password: "securepassword",
    password_confirmation: "securepassword",
    verified: true,
    subscription_status: "active",
    plan_type: "founder",
    trial_ends_at: 30.days.ago,
    current_period_end: 1.month.from_now,
    cancel_at_period_end: false
  )

  puts "Seeded user: #{user.email}"

  project_definitions = [
    {key: :focus_radar, name: "Focus Radar", color: "#6366F1"},
    {key: :atlas_dashboard, name: "Atlas Dashboard", color: "#10B981"},
    {key: :customer_portal, name: "Customer Portal Refresh", color: "#F97316"}
  ]

  projects = project_definitions.to_h do |attrs|
    key = attrs[:key]
    project = Project.find_or_initialize_by(id: SeedToolkit.stable_uuid("project:#{key}"))
    project.user ||= user
    project.name = attrs[:name]
    project.color = attrs[:color]
    project.save!
    [key, project]
  end

  person_definitions = [
    {key: :mira_patel, name: "Mira Patel"},
    {key: :liam_wong, name: "Liam Wong"},
    {key: :nora_alvarez, name: "Nora Alvarez"},
    {key: :samir_chopra, name: "Samir Chopra"}
  ]

  persons = person_definitions.to_h do |attrs|
    key = attrs[:key]
    person = Person.find_or_initialize_by(id: SeedToolkit.stable_uuid("person:#{key}"))
    person.user ||= user
    person.name = attrs[:name]
    person.save!
    [key, person]
  end

  {
    focus_radar: %i[mira_patel samir_chopra],
    atlas_dashboard: %i[liam_wong nora_alvarez],
    customer_portal: %i[mira_patel nora_alvarez]
  }.each do |project_key, collaborator_keys|
    project = projects.fetch(project_key)
    collaborator_keys.each do |person_key|
      person = persons.fetch(person_key)
      ProjectPerson.find_or_create_by!(project: project, person: person)
    end
  end

  entry_blueprints = [
    lambda do |ctx|
      project = ctx[:projects][:atlas_dashboard]
      {
        tag: "build",
        body_format: "tiptap",
        body: SeedToolkit.tiptap_body([
          {type: :text, text: "Polished the drill-down metrics inside "},
          {type: :mention, record: project},
          {type: :text, text: " and cached the new compare view so navigation feels instant."}
        ])
      }
    end,
    lambda do |ctx|
      project = ctx[:projects][:focus_radar]
      person = ctx[:persons][:mira_patel]
      {
        tag: "meeting",
        body_format: "tiptap",
        body: SeedToolkit.tiptap_body([
          {type: :text, text: "Deep dive with "},
          {type: :mention, record: person},
          {type: :text, text: " to clarify the next milestone for "},
          {type: :mention, record: project},
          {type: :text, text: ". We committed to ship the snapshot export before Friday."}
        ])
      }
    end,
    lambda do |ctx|
      project = ctx[:projects][:customer_portal]
      person = ctx[:persons][:liam_wong]
      {
        tag: "research",
        body_format: "tiptap",
        body: SeedToolkit.tiptap_body([
          {type: :text, text: "Interviewed "},
          {type: :mention, record: person},
          {type: :text, text: " about the onboarding gaps in "},
          {type: :mention, record: project},
          {type: :text, text: ". Biggest friction: permissions copy and the empty state."}
        ])
      }
    end,
    lambda do |_ctx|
      {
        tag: "retro",
        body_format: "plain",
        body: "Quick retro: energy stayed high after shorter standups. Pairing late in the day still drains me so I blocked a no-meeting window."
      }
    end,
    lambda do |ctx|
      project = ctx[:projects][:focus_radar]
      person = ctx[:persons][:nora_alvarez]
      {
        tag: "decision",
        body_format: "tiptap",
        body: SeedToolkit.tiptap_body([
          {type: :text, text: "Aligned with "},
          {type: :mention, record: person},
          {type: :text, text: " on scoping the automation rules for "},
          {type: :mention, record: project},
          {type: :text, text: ". We trimmed the backlog to three experiments so execution stays crisp."}
        ])
      }
    end,
    lambda do |_ctx|
      {
        tag: "learning",
        body_format: "plain",
        body: "Sketched the lifecycle metrics we actually care about and rewired the dashboard to highlight activation + quality instead of vanity graphs."
      }
    end
  ]

  start_date = Date.current - 29.days
  end_date = Date.current
  entries_window = start_date.beginning_of_day..end_date.end_of_day
  user.entries.where(logged_at: entries_window).destroy_all
  puts "Creating entries between #{start_date} and #{end_date}"

  context = {projects:, persons:}

  (start_date..end_date).each do |date|
    entries_for_day =
      if date.saturday? || date.sunday?
        1
      elsif date.friday?
        (date.cweek.even? ? 2 : 1)
      else
        2
      end

    entries_for_day.times do |index|
      blueprint = entry_blueprints[(date.yday + index) % entry_blueprints.length]
      payload = blueprint.call(context)
      logged_at = SeedToolkit.time_on(date, 9 + (index * 4), (date.day * 3 + index * 11) % 60)

      user.entries.create!(
        body: payload[:body],
        body_format: payload[:body_format],
        tag: payload[:tag],
        logged_at: logged_at,
        created_at: logged_at + 20.minutes,
        updated_at: logged_at + 20.minutes
      )
    end
  end

  schedule = NotificationSchedule.find_or_initialize_by(
    id: SeedToolkit.stable_uuid("notification_schedule:weekly_focus")
  )

  schedule.assign_attributes(
    user: user,
    name: "Monday Focus Digest",
    channel: :email,
    recurrence: :weekly,
    weekly_day: 1,
    time_of_day: Time.zone.parse("08:30"),
    timezone: "Europe/Berlin",
    lookback_type: :week,
    lead_time_minutes: 30,
    enabled: true,
    included_project_ids: [projects[:focus_radar].id]
  )
  schedule.save!

  monday = Date.current.beginning_of_week(:monday)
  delivery_occurrences = [
    SeedToolkit.time_on(monday - 14, 8, 30),
    SeedToolkit.time_on(monday - 7, 8, 30),
    SeedToolkit.time_on(monday + 7, 8, 30)
  ]

  delivery_payloads = [
    {
      status: :delivered,
      highlights: [
        "Shipped compare mode for Focus Radar",
        "Adopted async checkpoints with the insights pod"
      ],
      delivered_at_offset: 6.minutes
    },
    {
      status: :failed,
      highlights: [
        "Drafted automation rules",
        "Documented portal accessibility issues"
      ],
      error_message: "OpenAI API timeout after 40s"
    },
    {
      status: :pending,
      highlights: nil
    }
  ]

  delivery_occurrences.each_with_index do |occurrence_at, idx|
    payload = delivery_payloads[idx]
    window_start = occurrence_at - 1.week
    trigger_at = occurrence_at - schedule.lead_time_minutes.minutes
    summary_payload = if payload[:highlights]
      {
        entries_count: 8 + idx,
        highlights: payload[:highlights],
        window: {
          start: window_start.iso8601,
          end: occurrence_at.iso8601
        }
      }
    end

    delivery = NotificationDelivery.find_or_initialize_by(
      notification_schedule: schedule,
      occurrence_at: occurrence_at
    )

    delivery.assign_attributes(
      user: user,
      status: payload[:status],
      trigger_at: trigger_at,
      window_start: window_start,
      window_end: occurrence_at,
      summary_payload: summary_payload,
      summary_model: summary_payload ? "gpt-4o-mini" : nil,
      prompt_tokens: summary_payload ? 1_200 + (idx * 175) : nil,
      completion_tokens: summary_payload ? 360 + (idx * 40) : nil,
      delivered_at: payload[:delivered_at_offset] ? occurrence_at + payload[:delivered_at_offset] : nil,
      error_message: payload[:error_message]
    )
    delivery.save!
  end

  insight_payloads = [
    {
      key: :weekly_focus_summary,
      name: "Weekly focus summary",
      query_type: "summary",
      status: "completed",
      range_start: 7.days.ago.beginning_of_day,
      range_end: Time.current,
      project_keys: %i[focus_radar atlas_dashboard],
      person_keys: %i[mira_patel],
      content: <<~MARKDOWN,
        ### Highlights
        - Focus Radar adoption jumped after the new compare mode.
        - Atlas Dashboard latency now sits under 500ms P95.

        ### Next bets
        1. Harden automation rules before rolling to beta.
        2. Ship the onboarding checklist inside the portal revamp.
      MARKDOWN
      result_payload: {
        "summary" => "Momentum stayed high thanks to the compare launch and async rituals.",
        "action_items" => [
          {"title" => "Automation beta prep", "projectId" => nil},
          {"title" => "Portal onboarding checklist", "projectId" => nil}
        ]
      },
      result_model: "gpt-4o-mini",
      prompt_tokens: 2_180,
      completion_tokens: 640,
      completed_at: 2.days.ago
    },
    {
      key: :december_ideas,
      name: "December experiment ideas",
      query_type: "ideas",
      status: "generating",
      range_start: 14.days.ago.beginning_of_day,
      range_end: Time.current,
      project_keys: %i[customer_portal],
      person_keys: %i[liam_wong],
      content: nil,
      result_payload: nil,
      result_model: nil,
      prompt_tokens: nil,
      completion_tokens: nil,
      completed_at: nil
    },
    {
      key: :onboarding_review,
      name: "Onboarding bug review",
      query_type: "review",
      status: "failed",
      range_start: 21.days.ago.beginning_of_day,
      range_end: 7.days.ago.end_of_day,
      project_keys: %i[customer_portal],
      person_keys: %i[nora_alvarez],
      content: nil,
      result_payload: nil,
      result_model: "gpt-4o-mini",
      prompt_tokens: 1_750,
      completion_tokens: 0,
      completed_at: 5.days.ago,
      error_message: "Context window exceeded after streaming transcripts"
    }
  ]

  insight_payloads.each do |attrs|
    insight = InsightRequest.find_or_initialize_by(
      id: SeedToolkit.stable_uuid("insight:#{attrs[:key]}")
    )

    insight.assign_attributes(
      user: user,
      name: attrs[:name],
      query_type: attrs[:query_type],
      status: attrs[:status],
      date_range_start: attrs[:range_start],
      date_range_end: attrs[:range_end],
      project_ids: Array(attrs[:project_keys]).map { |key| projects[key].id },
      person_ids: Array(attrs[:person_keys]).map { |key| persons[key].id },
      content: attrs[:content],
      result_payload: attrs[:result_payload],
      result_model: attrs[:result_model],
      prompt_tokens: attrs[:prompt_tokens],
      completion_tokens: attrs[:completion_tokens],
      completed_at: attrs[:completed_at],
      error_message: attrs[:error_message]
    )
    insight.save!
  end

  puts "Seed data ready. Entries: #{user.entries.count}, Projects: #{projects.size}, Persons: #{persons.size}"
end
