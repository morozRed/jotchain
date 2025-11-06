# frozen_string_literal: true

module Summaries
  class DigestBuilder
    Result = Struct.new(
      :status,
      :window,
      :sections,
      :source_entries,
      :stats,
      :model,
      :usage,
      :raw_text,
      :error_message,
      keyword_init: true
    ) do
      def ok?
        status == :ok
      end

      def empty?
        status == :empty
      end

      def error?
        status == :error
      end

      def payload
        {
          status: status,
          window: window,
          sections: sections,
          source_entries: source_entries,
          stats: stats,
          model: model,
          usage: usage,
          raw_text: raw_text,
          error_message: error_message
        }.compact
      end
    end

    class Error < StandardError; end

    def initialize(user:, window:, schedule: nil, ai_client: Ai::Client)
      @user = user
      @window = window
      @schedule = schedule
      @ai_client = ai_client
    end

    def call
      entries = []
      entries = fetch_entries
      return Result.new(status: :empty, window: window_slice, sections: [], source_entries: [], stats: nil) if entries.empty?

      response = ai_client.call!(
        prompt: build_prompt(entries),
        model: preferred_model,
        response_format: json_schema_format,
        temperature: 0.3,
        max_output_tokens: 3000
      )

      parsed = parse_sections(response.text)

      Result.new(
        status: :ok,
        window: window_slice,
        sections: parsed,
        source_entries: serialize_entries(entries),
        stats: calculate_stats(entries),
        model: response.model,
        usage: response.usage,
        raw_text: response.text
      )
    rescue Ai::Client::Error => e
      Result.new(
        status: :error,
        window: window_slice,
        sections: [],
        source_entries: serialize_entries(entries),
        stats: calculate_stats(entries),
        model: preferred_model,
        error_message: e.message
      )
    rescue JSON::ParserError => e
      Result.new(
        status: :error,
        window: window_slice,
        sections: [],
        source_entries: serialize_entries(entries),
        stats: calculate_stats(entries),
        model: preferred_model,
        raw_text: nil,
        error_message: "Failed to parse AI response: #{e.message}"
      )
    end

    private

    attr_reader :user, :window, :schedule, :ai_client

    SECTION_SCHEMA = {
      name: "summary_digest",
      schema: {
        type: "object",
        properties: {
          sections: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                title: {type: "string"},
                bullets: {
                  type: "array",
                  items: {type: "string"},
                  minItems: 0
                }
              },
              required: %w[title bullets]
            }
          },
          insights: {
            type: "array",
            items: {type: "string"}
          }
        },
        required: ["sections"],
        additionalProperties: true
      }
    }.freeze

    def preferred_model
      ENV.fetch("AI_DEFAULT_MODEL", "gpt-5-mini")
    end

    def fetch_entries
      user.entries
        .for_period(window[:start]..window[:end])
        .includes(:user)
        .recent_first
    end

    def build_prompt(entries)
      <<~PROMPT
        You are an expert chief of staff preparing a crisp email stand-up summary for #{user.name}.
        Base your response ONLY on the notes provided and stay factual.

        OUTPUT REQUIREMENTS:
        - Reply strictly in JSON matching the provided schema.
        - Summaries must be concise, focused on wins, blockers, and upcoming focus.
        - Use professional tone, sentence fragments acceptable, no emoji.
        - Omit sections that would be empty by returning an empty bullets array.
        - Do not invent information that is not explicitly present in the notes.

        CONTEXT:
        - Time window: #{formatted_time(window[:start])} to #{formatted_time(window[:end])} (#{timezone_name})
        - Number of notes: #{entries.size}

        NOTES:
        #{formatted_entries(entries)}

        JSON SCHEMA:
        #{SECTION_SCHEMA.to_json}
      PROMPT
    end

    def parse_sections(text)
      json = JSON.parse(text, symbolize_names: true)
      sections = Array(json[:sections]).map do |section|
        {
          title: section[:title],
          bullets: Array(section[:bullets]).map { _1.to_s.strip }.reject(&:blank?)
        }
      end

      sections.reject { |section| section[:bullets].blank? }
    end

    def serialize_entries(entries)
      entries.map do |entry|
        {
          id: entry.id,
          logged_at: entry.logged_at,
          tag: entry.tag,
          body: entry.body_text
        }
      end
    end

    def calculate_stats(entries)
      return nil if entries.empty?

      # Group entries by date
      entries_by_date = entries.group_by { |entry| entry.logged_at.in_time_zone(timezone).to_date }

      # Find most productive day
      most_productive_day = entries_by_date.max_by { |_date, daily_entries| daily_entries.size }
      most_productive_day_name = most_productive_day&.first&.strftime("%A")

      {
        current_streak: user.current_streak,
        most_productive_day: most_productive_day_name,
        total_notes: entries.size
      }
    end

    def formatted_entries(entries)
      entries
        .group_by { |entry| entry.logged_at.in_time_zone(timezone).to_date }
        .sort_by { |date, _| date }
        .map do |date, daily_entries|
          [
            "# #{date.strftime('%A, %B %d')}",
            daily_entries.map { |entry| "- #{entry_timestamp(entry)} #{format_tag(entry)}#{truncate(normalize_body(entry.body_text))}" }
          ].flatten.join("\n")
        end
        .join("\n")
    end

    def entry_timestamp(entry)
      entry.logged_at.in_time_zone(timezone).strftime("%H:%M")
    end

    def format_tag(entry)
      entry.tag.present? ? "[#{entry.tag}] " : ""
    end

    def truncate(text, limit: 450)
      return text if text.length <= limit

      "#{text.slice(0, limit)}…"
    end

    def normalize_body(text)
      text.to_s.gsub(/\s+/, " ").strip
    end

    def json_schema_format
      {
        type: "json_schema",
        json_schema: SECTION_SCHEMA
      }
    end

    def window_slice
      {
        start: window[:start],
        end: window[:end]
      }
    end

    def timezone
      @timezone ||= schedule&.inferred_time_zone || Time.zone || ActiveSupport::TimeZone["UTC"]
    end

    def timezone_name
      timezone.name || "UTC"
    end

    def formatted_time(time)
      time.in_time_zone(timezone).strftime("%Y-%m-%d %H:%M")
    end
  end
end
