# frozen_string_literal: true

require "net/https"
require "json"

module Ai
  class Client
    class Error < StandardError; end
    class ConfigurationError < Error; end

    Response = Struct.new(
      :text,
      :model,
      :usage,
      :raw,
      keyword_init: true
    )

    DEFAULT_TIMEOUT = (ENV.fetch("AI_TIMEOUT_SECONDS", 90).to_i).clamp(5, 120)

    def self.call!(prompt:, **options)
      new.call!(prompt:, **options)
    end

    def call!(prompt:, model: default_model, attempt_fallback: true, messages: nil, **options)
      call_once(prompt:, messages:, model:, **options)
    rescue Error => e
      fallback = fallback_model
      if attempt_fallback && fallback.present? && fallback != model
        call_once(prompt:, messages:, model: fallback, **options)
      else
        raise e
      end
    end

    private

    def api_key
      ENV["OPENAI_API_KEY"].presence || raise(ConfigurationError, "OPENAI_API_KEY is not set")
    end

    def base_uri
      @base_uri ||= URI.parse(ENV.fetch("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions"))
    end

    def default_model
      ENV.fetch("AI_DEFAULT_MODEL", "gpt-5-mini")
    end

    def fallback_model
      ENV["AI_FALLBACK_MODEL"].presence
    end

    def call_once(prompt:, messages:, model:, temperature: 0.3, max_output_tokens: nil, response_format: nil, **options)
      payload = build_payload(prompt:, messages:, model:, temperature:, max_output_tokens:, response_format:, **options)
      http = Net::HTTP.new(base_uri.host, base_uri.port)
      http.use_ssl = base_uri.scheme == "https"
      http.read_timeout = DEFAULT_TIMEOUT
      http.open_timeout = DEFAULT_TIMEOUT
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE

      request = Net::HTTP::Post.new(base_uri.request_uri, headers)
      request.body = JSON.generate(payload)

      response = http.request(request)
      body = parse_body(response)
      ensure_ok!(response, body)

      message = extract_message(body)
      usage = body["usage"] || {}

      Response.new(
        text: extract_text(message),
        model: body["model"] || model,
        usage: {
          prompt_tokens: usage["prompt_tokens"],
          completion_tokens: usage["completion_tokens"],
          total_tokens: usage["total_tokens"]
        }.compact,
        raw: body
      )
    end

    def headers
      {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }
    end

    def build_payload(prompt:, messages:, model:, temperature:, max_output_tokens:, response_format:, **options)
      compiled_messages = Array(messages).presence || [{role: "user", content: prompt}]

      payload = {
        model: model,
        messages: compiled_messages,
      }

      payload[:max_completion_tokens] = max_output_tokens if max_output_tokens
      payload[:response_format] = response_format if response_format

      payload.merge!(options) if options.present?
      payload
    end

    def parse_body(response)
      JSON.parse(response.body)
    rescue JSON::ParserError => e
      raise Error, "Failed to parse AI response: #{e.message}"
    end

    def ensure_ok!(response, body)
      return if response.is_a?(Net::HTTPSuccess)

      message = body["error"]&.fetch("message", nil) || response.body
      raise Error, "AI request failed (#{response.code}): #{message}"
    end

    def extract_message(body)
      first_choice = Array(body["choices"]).first
      return {} unless first_choice

      first_choice["message"] || {}
    end

    def extract_text(message)
      content = message["content"]

      case content
      when String
        content
      when Array
        content.map do |part|
          if part.is_a?(String)
            part
          elsif part.is_a?(Hash)
            part["text"] || part["output_text"] || part["json"]&.to_json
          end
        end.compact.join("\n")
      when Hash
        content["text"] || content["output_text"] || content["json"]&.to_json
      else
        content&.to_s
      end
    end
  end
end
