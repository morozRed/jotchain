require 'openai'

class AiInsightsService
  def initialize(user)
    @user = user
    if Rails.application.credentials.dig(:openai_api_key).present?
      @client = OpenAI::Client.new(access_token: Rails.application.credentials.dig(:openai_api_key))
    end
  end

  def generate_tweet_suggestions(timeframe = 'week')
    entries = get_entries_for_timeframe(timeframe)
    return { error: "No entries found for the selected timeframe" } if entries.empty?
    return { error: "OpenAI API key not configured" } unless @client

    prompt = build_tweet_prompt(entries)

    begin
      response = @client.chat(
        parameters: {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500
        }
      )

      content = response.dig("choices", 0, "message", "content")
      parse_tweet_suggestions(content)
    rescue => e
      { error: "Failed to generate suggestions: #{e.message}" }
    end
  end

  def generate_blog_ideas(timeframe = 'month')
    entries = get_entries_for_timeframe(timeframe)
    return { error: "No entries found for the selected timeframe" } if entries.empty?
    return { error: "OpenAI API key not configured" } unless @client

    prompt = build_blog_prompt(entries)

    begin
      response = @client.chat(
        parameters: {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 800
        }
      )

      content = response.dig("choices", 0, "message", "content")
      parse_blog_ideas(content)
    rescue => e
      { error: "Failed to generate ideas: #{e.message}" }
    end
  end

  def generate_wins_summary(timeframe = 'month')
    wins = @user.entries.wins.where(entry_date: timeframe_range(timeframe))
    return { error: "No wins found for the selected timeframe" } if wins.empty?
    return { error: "OpenAI API key not configured" } unless @client

    prompt = build_wins_summary_prompt(wins, timeframe)

    begin
      response = @client.chat(
        parameters: {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 1000
        }
      )

      content = response.dig("choices", 0, "message", "content")
      { summary: content, wins_count: wins.count }
    rescue => e
      { error: "Failed to generate summary: #{e.message}" }
    end
  end

  def generate_meeting_prep(meeting_type = 'weekly')
    timeframe = meeting_type == 'weekly' ? 'week' : 'month'
    entries = get_entries_for_timeframe(timeframe)
    return { error: "No entries found for the selected timeframe" } if entries.empty?
    return { error: "OpenAI API key not configured" } unless @client

    prompt = build_meeting_prep_prompt(entries, meeting_type)

    begin
      response = @client.chat(
        parameters: {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          max_tokens: 1200
        }
      )

      content = response.dig("choices", 0, "message", "content")
      { prep_notes: content, entries_count: entries.count }
    rescue => e
      { error: "Failed to generate meeting prep: #{e.message}" }
    end
  end

  private

  def get_entries_for_timeframe(timeframe)
    @user.entries.where(entry_date: timeframe_range(timeframe)).recent
  end

  def timeframe_range(timeframe)
    case timeframe
    when 'week'
      1.week.ago.to_date..Date.current
    when 'month'
      1.month.ago.to_date..Date.current
    when 'quarter'
      3.months.ago.to_date..Date.current
    else
      1.week.ago.to_date..Date.current
    end
  end

  def build_tweet_prompt(entries)
    content = entries.map { |e| "#{e.entry_date}: #{e.content}" }.join("\n\n")

    <<~PROMPT
      Based on the following journal entries, suggest 5 engaging tweets about professional accomplishments and insights.
      Make them authentic, valuable, and engaging. Each tweet should be under 280 characters.

      Journal Entries:
      #{content.truncate(3000)}

      Format your response as:
      1. [Tweet text]
      2. [Tweet text]
      etc.
    PROMPT
  end

  def build_blog_prompt(entries)
    content = entries.map { |e| "#{e.entry_date}: #{e.content}" }.join("\n\n")

    <<~PROMPT
      Based on these journal entries, suggest 5 blog post ideas with titles and brief outlines.
      Focus on lessons learned, insights gained, and valuable experiences.

      Journal Entries:
      #{content.truncate(3000)}

      Format each idea as:
      Title: [Blog title]
      Outline: [2-3 sentence description]
    PROMPT
  end

  def build_wins_summary_prompt(wins, timeframe)
    wins_text = wins.map do |w|
      "- [#{w.win_level&.humanize}] #{w.entry_date}: #{w.content}\n  Win: #{w.win_description}"
    end.join("\n\n")

    <<~PROMPT
      Create a professional summary of the following wins from the past #{timeframe}.
      Group them by impact level and highlight key achievements.
      Make it suitable for performance reviews or professional updates.

      Wins:
      #{wins_text.truncate(3000)}

      Format as a professional summary with sections for major achievements, key contributions, and growth areas.
    PROMPT
  end

  def build_meeting_prep_prompt(entries, meeting_type)
    content = entries.map do |e|
      text = "#{e.entry_date}: #{e.content}"
      text += "\nNext Actions: #{e.next_actions}" if e.next_actions.present?
      text
    end.join("\n\n")

    <<~PROMPT
      Based on these journal entries, prepare talking points for a #{meeting_type} team meeting.
      Include: accomplishments, challenges faced, next priorities, and any blockers or needs.

      Journal Entries:
      #{content.truncate(3000)}

      Format as:
      ACCOMPLISHMENTS:
      - [Key achievement points]

      CHALLENGES & SOLUTIONS:
      - [Challenges faced and how they were addressed]

      NEXT PRIORITIES:
      - [Upcoming focus areas]

      NEEDS/BLOCKERS:
      - [Any support needed]
    PROMPT
  end

  def parse_tweet_suggestions(content)
    return { error: "No content generated" } if content.blank?

    tweets = content.split(/\d+\./).map(&:strip).reject(&:blank?)
    { tweets: tweets }
  end

  def parse_blog_ideas(content)
    return { error: "No content generated" } if content.blank?

    ideas = []
    content.split(/(?=Title:)/).each do |section|
      next if section.blank?

      if section =~ /Title:\s*(.+?)\n.*?Outline:\s*(.+)/m
        ideas << { title: $1.strip, outline: $2.strip }
      end
    end

    { ideas: ideas }
  end
end