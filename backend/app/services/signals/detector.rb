# frozen_string_literal: true

module Signals
  class Detector
    Result = Struct.new(
      :status,
      :signals_created,
      :signals_updated,
      :model,
      :usage,
      :error_message,
      keyword_init: true
    ) do
      def ok?
        status == :ok
      end

      def error?
        status == :error
      end
    end

    class Error < StandardError; end

    # Analyze last N days of entries
    LOOKBACK_DAYS = 14
    # Minimum entries for analysis
    MIN_ENTRIES = 3

    def initialize(user:, ai_client: Ai::Client)
      @user = user
      @ai_client = ai_client
    end

    def call
      entries = fetch_entries
      return empty_result if entries.size < MIN_ENTRIES

      response = ai_client.call!(
        prompt: build_prompt(entries),
        model: preferred_model,
        response_format: json_schema_format,
        temperature: 0.3,
        max_output_tokens: 4000
      )

      parsed = parse_response(response.text)
      result = process_signals(parsed[:signals] || [], entries)

      Result.new(
        status: :ok,
        signals_created: result[:created],
        signals_updated: result[:updated],
        model: response.model,
        usage: response.usage
      )
    rescue Ai::Client::Error => e
      error_result(e.message)
    rescue JSON::ParserError => e
      error_result("Failed to parse AI response: #{e.message}")
    end

    private

    attr_reader :user, :ai_client

    def fetch_entries
      user.entries
        .for_period(LOOKBACK_DAYS.days.ago..Time.current)
        .includes(:mentioned_projects, :mentioned_persons)
        .recent_first
    end

    def build_prompt(entries)
      <<~PROMPT
        You are an expert pattern analyst helping identify recurring themes in work journal entries.

        TASK: Analyze the following journal entries and identify signals/patterns.

        SIGNAL TYPES TO DETECT:
        #{format_signal_types}

        RULES:
        1. Only report signals that appear in 3+ entries
        2. Each signal must have a specific entity_name (project, person, topic, or activity)
        3. Assign confidence 0-100 based on pattern strength and clarity
        4. Include entry indices that support each signal
        5. Extract a brief, actionable title for each signal
        6. Be conservative - only surface clear, actionable patterns
        7. For blockers/time_sinks, look for frustration, delays, or repeated obstacles
        8. For wins/impact/learnings, look for accomplishments, helping others, and growth

        CRITICAL - RECURRING ISSUES DETECTION:
        9. If the same task/problem appears multiple times (e.g., "helped X with dashboard access", "fixed access for Y", "granted access to Z"), this is a RECURRING ISSUE, not impact.
        10. Repeated "helping" with the same issue indicates a systemic problem needing a permanent fix (documentation, automation, better UX).
        11. Look for patterns like: same task for different people, same fix multiple times, same question being answered repeatedly.
        12. Use "recurring_issues" type when you see 3+ entries about solving the same underlying problem, even if each entry mentions a different person.
        13. The title for recurring_issues should highlight what keeps happening (e.g., "Dashboard access issues keep recurring", "Repeatedly fixing login problems").

        ENTRIES (#{entries.size} total):
        #{format_entries(entries)}

        Respond with valid JSON matching the provided schema.
      PROMPT
    end

    def format_signal_types
      TypeRegistry.all.map do |type, config|
        "- #{type}: #{config[:description]} (keywords: #{config[:keywords].join(', ')})"
      end.join("\n")
    end

    def format_entries(entries)
      entries.each_with_index.map do |entry, idx|
        projects = entry.mentioned_projects.map(&:name).join(", ")
        persons = entry.mentioned_persons.map(&:name).join(", ")
        mentions = [projects, persons].reject(&:blank?).join("; ")
        mention_tag = mentions.present? ? " [mentions: #{mentions}]" : ""

        "[#{idx}] #{entry.logged_at.strftime('%Y-%m-%d')}: #{truncate(entry.body_text)}#{mention_tag}"
      end.join("\n")
    end

    def truncate(text, limit: 300)
      return text if text.length <= limit
      "#{text.slice(0, limit)}..."
    end

    def json_schema_format
      {
        type: "json_schema",
        json_schema: {
          name: "signal_detection",
          schema: {
            type: "object",
            properties: {
              signals: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    signal_type: {type: "string", enum: WorkSignal::SIGNAL_TYPES},
                    entity_name: {type: "string"},
                    title: {type: "string"},
                    confidence: {type: "integer", minimum: 0, maximum: 100},
                    entry_indices: {type: "array", items: {type: "integer"}},
                    reasoning: {type: "string"},
                    keywords_found: {type: "array", items: {type: "string"}},
                    related_entities: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          entity_type: {type: "string", enum: %w[project person topic keyword]},
                          name: {type: "string"}
                        },
                        required: %w[entity_type name]
                      }
                    }
                  },
                  required: %w[signal_type entity_name title confidence entry_indices]
                }
              }
            },
            required: ["signals"]
          }
        }
      }
    end

    def parse_response(text)
      JSON.parse(text, symbolize_names: true)
    end

    def process_signals(signals_data, entries)
      created = 0
      updated = 0

      signals_data.each do |signal_data|
        signal = find_or_initialize_signal(signal_data)
        is_new = signal.new_record?

        signal.assign_attributes(
          title: signal_data[:title],
          confidence: signal_data[:confidence],
          last_detected_at: Time.current,
          context_payload: {
            reasoning: signal_data[:reasoning],
            keywords_found: signal_data[:keywords_found]
          }
        )

        if signal.save
          sync_signal_entries(signal, signal_data[:entry_indices], entries)
          sync_signal_entities(signal, signal_data[:related_entities] || [])

          is_new ? created += 1 : updated += 1
        end
      end

      {created: created, updated: updated}
    end

    def find_or_initialize_signal(signal_data)
      user.work_signals.find_or_initialize_by(
        signal_type: signal_data[:signal_type],
        entity_name: signal_data[:entity_name]
      ) do |signal|
        signal.first_detected_at = Time.current
        signal.last_detected_at = Time.current
        signal.source = "ai"
        signal.status = "active"
      end
    end

    def sync_signal_entries(signal, entry_indices, entries)
      ordered_entries = Array(entry_indices).uniq.map { |idx| entries[idx] }.compact
      desired_entry_ids = ordered_entries.map(&:id)

      entries_scope = signal.signal_entries.where(role: %w[trigger evidence])
      if desired_entry_ids.empty?
        entries_scope.delete_all
      else
        entries_scope.where.not(entry_id: desired_entry_ids).delete_all
      end

      ordered_entries.each_with_index do |entry, position|
        signal_entry = signal.signal_entries.find_or_initialize_by(entry: entry)
        next if signal_entry.persisted? && signal_entry.role == "reflection"

        signal_entry.role = position.zero? ? "trigger" : "evidence"
        signal_entry.excerpt = truncate(entry.body_text, limit: 200)
        signal_entry.score = 1.0 - (position * 0.1) # Decay score by position
        signal_entry.save!
      end
    end

    def sync_signal_entities(signal, entities_data)
      now = Time.current
      Array(entities_data)
        .uniq { |entity| [entity[:entity_type], entity[:name].to_s.downcase] }
        .each do |entity_data|
          next if entity_data[:entity_type].blank? || entity_data[:name].blank?

          # Try to link to actual project/person if exists
          mentionable = find_mentionable(entity_data)

          signal_entity = signal.signal_entities.find_or_initialize_by(
            entity_type: entity_data[:entity_type],
            name: entity_data[:name]
          )
          signal_entity.mentionable = mentionable if mentionable
          signal_entity.last_seen_at = now
          signal_entity.count = signal_entity.new_record? ? 1 : signal_entity.count.to_i + 1
          signal_entity.save!
        end
    end

    def find_mentionable(entity_data)
      case entity_data[:entity_type]
      when "project"
        user.projects.find_by("LOWER(name) = ?", entity_data[:name].downcase)
      when "person"
        user.persons.find_by("LOWER(name) = ?", entity_data[:name].downcase)
      end
    end

    def empty_result
      Result.new(
        status: :ok,
        signals_created: 0,
        signals_updated: 0
      )
    end

    def error_result(message)
      Result.new(
        status: :error,
        signals_created: 0,
        signals_updated: 0,
        error_message: message
      )
    end

    def preferred_model
      ENV.fetch("AI_DEFAULT_MODEL", "gpt-5-mini")
    end
  end
end
