# frozen_string_literal: true

module Insights
  class Generator
    Result = Struct.new(
      :status,
      :sections,
      :content,
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
    end

    class Error < StandardError; end

    def initialize(user:, insight_request:, ai_client: Ai::Client)
      @user = user
      @insight_request = insight_request
      @ai_client = ai_client
    end

    def call
      entries = fetch_entries
      return empty_result if entries.empty?

      response = ai_client.call!(
        prompt: build_prompt(entries),
        model: preferred_model,
        response_format: json_schema_format,
        temperature: 0.7, # Higher creativity for insights
        max_output_tokens: 4000
      )

      parsed = parse_response(response.text)
      content = format_content(parsed, insight_request.query_type)

      Result.new(
        status: :ok,
        sections: parsed[:sections] || [],
        content: content,
        stats: calculate_stats(entries),
        model: response.model,
        usage: response.usage,
        raw_text: response.text
      )
    rescue Ai::Client::Error => e
      error_result(e.message)
    rescue JSON::ParserError => e
      error_result("Failed to parse AI response: #{e.message}")
    end

    private

    attr_reader :user, :insight_request, :ai_client

    def fetch_entries
      scope = user.entries.for_period(date_range).includes(:mentioned_projects, :mentioned_persons)

      # Filter by projects if specified
      if insight_request.project_ids.present? && !insight_request.project_ids.include?("all")
        project_ids = insight_request.project_ids
        scope = scope.joins(:project_entry_mentions)
          .merge(EntryMention.projects.where(mentionable_id: project_ids))
          .distinct
      end

      # Filter by persons if specified
      if insight_request.person_ids.present? && !insight_request.person_ids.include?("all")
        person_ids = insight_request.person_ids
        scope = scope.joins(:person_entry_mentions)
          .merge(EntryMention.persons.where(mentionable_id: person_ids))
          .distinct
      end

      scope.recent_first
    end

    def date_range
      insight_request.date_range_start..insight_request.date_range_end
    end

    def build_prompt(entries)
      base_context = <<~CONTEXT
        You are an expert analyst helping #{user.name} extract insights from their work notes.

        CONTEXT:
        - Date range: #{format_date(insight_request.date_range_start)} to #{format_date(insight_request.date_range_end)}
        - Number of entries: #{entries.size}
        #{project_context(entries)}
        #{person_context(entries)}

        ENTRIES:
        #{format_entries(entries)}
      CONTEXT

      query_prompt = query_specific_prompt(insight_request.query_type, insight_request.custom_query)

      base_context + "\n\n" + query_prompt
    end

    def query_specific_prompt(query_type, custom_query)
      case query_type
      when "summary"
        <<~PROMPT
          Generate a professional work summary with these sections:
          1. Key Accomplishments - Major wins and completed work (3-5 bullets)
          2. Challenges & Learnings - Problems faced and lessons learned (2-3 bullets if applicable)
          3. Next Steps - Mentioned upcoming work or priorities (2-3 bullets if applicable)

          OUTPUT FORMAT: JSON with 'sections' array, each with 'title' and 'bullets'.
          Keep it concise (150-300 words total), professional, and achievement-focused.
        PROMPT
      when "tweets"
        <<~PROMPT
          Generate a Twitter/X thread of 3-5 tweets based on the user's work and learnings.
          Focus on: key insights, lessons learned, behind-the-scenes details, or interesting challenges.

          OUTPUT FORMAT: JSON with 'sections' array. Single section with title "Tweet Thread", bullets are individual tweets (max 280 chars each).
          Tweet 1 should be a hook. Middle tweets are insights. Final tweet is conclusion/CTA.
          Keep it engaging, conversational, and authentic.
        PROMPT
      when "review"
        <<~PROMPT
          Generate a formal performance review summary with these sections:
          1. Executive Summary - Brief overview of the period
          2. Major Projects & Outcomes - Key work completed with impact (3-5 bullets)
          3. Collaboration & Teamwork - How they worked with others (2-3 bullets)
          4. Skills Developed - Technical or professional growth (2-3 bullets)
          5. Future Goals - Mentioned aspirations or upcoming focus areas (2-3 bullets if applicable)

          OUTPUT FORMAT: JSON with 'sections' array, each with 'title' and 'bullets'.
          Length: 400-600 words total. Use professional tone, action verbs, quantify when possible.
        PROMPT
      when "blog"
        <<~PROMPT
          Generate a blog post draft based on the user's work and learnings.
          Structure:
          1. Introduction - Compelling hook that introduces the topic
          2. Background/Context - Set up the situation or problem
          3. Main Content - Core insights, organized into 2-4 subsections with headers
          4. Lessons Learned - Key takeaways and reflections
          5. Conclusion - Summary and call to action

          OUTPUT FORMAT: JSON with 'sections' array, each with 'title' and 'bullets' (bullets are paragraphs).
          Length: 800-1200 words total. Use engaging, conversational tone with concrete examples.
        PROMPT
      when "update"
        <<~PROMPT
          Generate a team status update email with these sections:
          1. Accomplishments - What we completed this period (3-5 bullets)
          2. In Progress - Current focus areas (2-3 bullets)
          3. Blockers - Challenges or help needed (1-3 bullets if applicable)
          4. Next Milestones - Upcoming deliverables (2-3 bullets)

          OUTPUT FORMAT: JSON with 'sections' array, each with 'title' and 'bullets'.
          Length: 200-400 words total. Clear, concise, stakeholder-friendly language.
        PROMPT
      when "ideas"
        <<~PROMPT
          Generate 10-15 content ideas based on the user's work, learnings, and experiences.
          For each idea, provide:
          - A compelling title/topic
          - Brief description of the angle or key points to cover
          - Why it's relevant or interesting

          OUTPUT FORMAT: JSON with 'sections' array. Single section with title "Content Ideas", each bullet is one idea (2-3 sentences).
          Focus on: tutorials, lessons learned, behind-the-scenes, tips, case studies, opinion pieces.
        PROMPT
      when "custom"
        <<~PROMPT
          USER REQUEST: #{custom_query}

          Analyze the entries and provide insights that address the user's request.
          Organize your response into logical sections with clear headers.

          OUTPUT FORMAT: JSON with 'sections' array, each with 'title' and 'bullets'.
          Keep it relevant, actionable, and based strictly on the provided entries.
        PROMPT
      else
        raise ArgumentError, "Unknown query type: #{query_type}"
      end
    end

    def json_schema_format
      {
        type: "json_schema",
        json_schema: {
          name: "insight_response",
          schema: {
            type: "object",
            properties: {
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: {type: "string"},
                    bullets: {
                      type: "array",
                      items: {type: "string"}
                    }
                  },
                  required: ["title", "bullets"]
                }
              }
            },
            required: ["sections"]
          }
        }
      }
    end

    def parse_response(text)
      JSON.parse(text, symbolize_names: true)
    end

    def format_content(parsed, query_type)
      sections = parsed[:sections] || []
      return "" if sections.empty?

      case query_type
      when "tweets"
        # For tweets, just join with newlines
        sections.flat_map { |s| s[:bullets] }.join("\n\n")
      else
        # For other types, format with section headers
        sections.map do |section|
          bullets = section[:bullets].map { |b| "• #{b}" }.join("\n")
          "#{section[:title]}\n#{bullets}"
        end.join("\n\n")
      end
    end

    def calculate_stats(entries)
      project_breakdown = {}

      if insight_request.project_ids.present? && !insight_request.project_ids.include?("all")
        projects = user.projects.where(id: insight_request.project_ids)
        projects.each do |project|
          count = entries.select { |e| e.mentioned_projects.include?(project) }.size
          project_breakdown[project.name] = count if count > 0
        end
      end

      {
        total_entries: entries.size,
        date_range_days: (insight_request.date_range_end.to_date - insight_request.date_range_start.to_date).to_i + 1,
        current_streak: user.current_streak,
        project_breakdown: project_breakdown
      }
    end

    def project_context(entries)
      return "" unless insight_request.project_ids.present? && !insight_request.project_ids.include?("all")

      projects = user.projects.where(id: insight_request.project_ids)
      project_names = projects.map(&:name).join(", ")
      "- Filtered to projects: #{project_names}"
    end

    def person_context(entries)
      return "" unless insight_request.person_ids.present? && !insight_request.person_ids.include?("all")

      persons = user.persons.where(id: insight_request.person_ids)
      person_names = persons.map(&:name).join(", ")
      "- Filtered to people: #{person_names}"
    end

    def format_entries(entries)
      entries.map do |entry|
        timestamp = entry.logged_at.strftime("%Y-%m-%d %H:%M")
        projects = entry.mentioned_projects.map(&:name).join(", ")
        project_tag = projects.present? ? " [#{projects}]" : ""
        "- #{timestamp}#{project_tag}: #{truncate(entry.body_text)}"
      end.join("\n")
    end

    def truncate(text, limit: 450)
      return text if text.length <= limit
      "#{text.slice(0, limit)}…"
    end

    def format_date(datetime)
      datetime.strftime("%Y-%m-%d")
    end

    def empty_result
      Result.new(
        status: :empty,
        sections: [],
        content: "",
        stats: nil,
        error_message: "No entries found for the selected filters"
      )
    end

    def error_result(message)
      Result.new(
        status: :error,
        sections: [],
        content: "",
        stats: nil,
        error_message: message
      )
    end

    def preferred_model
      ENV.fetch("AI_DEFAULT_MODEL", "gpt-5-mini")
    end
  end
end
