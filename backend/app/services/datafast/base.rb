# frozen_string_literal: true

require "httparty"

module Datafast
  class Base
    DEFAULT_BASE_URL = "https://datafa.st/api/v1"
    DEFAULT_TIMEOUT_SECONDS = 10

    class Error < StandardError; end
    class ConfigurationError < Error; end
    class RequestError < Error; end

    def initialize(
      api_key: ENV["DATAFAST_API_KEY"],
      base_url: ENV["DATAFAST_API_BASE_URL"],
      http_client: HTTParty,
      logger: Rails.logger,
      timeout_seconds: nil
    )
      @api_key = api_key
      @base_url = (base_url.presence || DEFAULT_BASE_URL)
      @http_client = http_client
      @logger = logger || Rails.logger
      @timeout_seconds = timeout_seconds || default_timeout
    end

    protected

    attr_reader :logger

    def request(method:, path:, body: nil, query: nil)
      raise ConfigurationError, "DATAFAST_API_KEY is not configured" unless configured?

      response = http_client.public_send(
        method,
        build_url(path),
        request_options(body:, query:)
      )

      handle_response(response)
    rescue SocketError, Timeout::Error, Errno::ECONNREFUSED, HTTParty::Error => e
      logger.error("[Datafast] Request failed: #{e.message}")
      raise RequestError, e.message
    end

    private

    attr_reader :api_key, :base_url, :http_client, :timeout_seconds

    def configured?
      api_key.present?
    end

    def default_timeout
      (ENV.fetch("DATAFAST_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS).to_i).clamp(1, 60)
    end

    def build_url(path)
      normalized_path = path.to_s.sub(%r{^/+}, "")
      "#{base_url.chomp('/')}/#{normalized_path}"
    end

    def request_options(body:, query:)
      options = {
        headers: default_headers,
        timeout: timeout_seconds
      }

      options[:body] = body.to_json unless body.nil?
      options[:query] = query unless query.nil?
      options
    end

    def default_headers
      {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }
    end

    def handle_response(response)
      parsed_body = parse_body(response.body)

      if success_status?(response.code)
        parsed_body
      else
        message = extract_error_message(parsed_body, response.body)
        raise RequestError, "DataFast request failed (#{response.code}): #{message}"
      end
    end

    def parse_body(body)
      return {} if body.blank?

      parsed = JSON.parse(body)
      parsed.is_a?(Hash) ? parsed.deep_symbolize_keys : parsed
    rescue JSON::ParserError => e
      raise RequestError, "DataFast responded with invalid JSON: #{e.message}"
    end

    def extract_error_message(parsed_body, raw_body)
      case parsed_body
      when Hash
        parsed_body[:error]&.fetch(:message, nil) ||
          parsed_body[:message] ||
          parsed_body[:errors]&.join(", ")
      else
        raw_body
      end
    end

    def success_status?(code)
      code.to_i.between?(200, 299)
    end
  end
end

