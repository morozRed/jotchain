# frozen_string_literal: true

module GithubService
  class Client
    class Error < StandardError; end
    class AuthenticationError < Error; end
    class RateLimitError < Error; end
    class NotFoundError < Error; end

    BASE_URL = "https://api.github.com"
    API_VERSION = "2022-11-28"
    DEFAULT_TIMEOUT = 30
    MAX_RETRIES = 3
    RETRY_DELAY = 1

    Response = Struct.new(:data, :headers, :status, keyword_init: true) do
      def rate_limit_remaining
        headers["x-ratelimit-remaining"]&.to_i
      end

      def rate_limit_reset
        timestamp = headers["x-ratelimit-reset"]&.to_i
        timestamp ? Time.at(timestamp) : nil
      end

      def success?
        status >= 200 && status < 300
      end
    end

    def initialize(installation:)
      @installation = installation
    end

    # GET request with automatic pagination support
    def get(path, params: {}, paginate: false)
      if paginate
        get_paginated(path, params: params)
      else
        request(:get, path, params: params)
      end
    end

    # POST request
    def post(path, body: {})
      request(:post, path, body: body)
    end

    # PATCH request
    def patch(path, body: {})
      request(:patch, path, body: body)
    end

    # DELETE request
    def delete(path)
      request(:delete, path)
    end

    # Convenience methods for common endpoints

    def repository(owner:, repo:)
      get("/repos/#{owner}/#{repo}")
    end

    def repositories
      get("/installation/repositories", paginate: true)
    end

    def commits(owner:, repo:, since: nil, until_date: nil, per_page: 100)
      params = { per_page: per_page }
      params[:since] = since.iso8601 if since
      params[:until] = until_date.iso8601 if until_date
      get("/repos/#{owner}/#{repo}/commits", params: params, paginate: true)
    end

    def pull_requests(owner:, repo:, state: "all", per_page: 100)
      get("/repos/#{owner}/#{repo}/pulls", params: { state: state, per_page: per_page }, paginate: true)
    end

    def pull_request(owner:, repo:, number:)
      get("/repos/#{owner}/#{repo}/pulls/#{number}")
    end

    def reviews(owner:, repo:, pull_number:)
      get("/repos/#{owner}/#{repo}/pulls/#{pull_number}/reviews", paginate: true)
    end

    def issues(owner:, repo:, state: "all", per_page: 100)
      get("/repos/#{owner}/#{repo}/issues", params: { state: state, per_page: per_page }, paginate: true)
    end

    def contributors(owner:, repo:)
      get("/repos/#{owner}/#{repo}/contributors", paginate: true)
    end

    private

    def request(method, path, params: {}, body: nil, retry_count: 0)
      ensure_valid_token!

      url = "#{BASE_URL}#{path}"
      options = build_options(params, body)

      response = perform_request(method, url, options)
      handle_response(response, method, path, params, body, retry_count)
    end

    def get_paginated(path, params: {})
      all_data = []
      page = 1

      loop do
        response = request(:get, path, params: params.merge(page: page, per_page: 100))

        # Handle different response structures
        data = extract_paginated_data(response.data)
        break if data.empty?

        all_data.concat(data)
        break if data.size < 100

        page += 1

        # Respect rate limits
        if response.rate_limit_remaining && response.rate_limit_remaining < 10
          sleep_until_reset(response.rate_limit_reset)
        end
      end

      all_data
    end

    def extract_paginated_data(data)
      case data
      when Array
        data
      when Hash
        # Some endpoints return { repositories: [...] } or similar
        data.values.find { |v| v.is_a?(Array) } || []
      else
        []
      end
    end

    def ensure_valid_token!
      unless @installation.access_token_valid?
        unless @installation.refresh_access_token!
          raise AuthenticationError, "Failed to refresh installation access token"
        end
      end
    end

    def build_options(params, body)
      options = {
        headers: headers,
        timeout: DEFAULT_TIMEOUT
      }
      options[:query] = params if params.present?
      options[:body] = body.to_json if body.present?
      options
    end

    def headers
      {
        "Authorization" => "Bearer #{@installation.access_token}",
        "Accept" => "application/vnd.github+json",
        "X-GitHub-Api-Version" => API_VERSION,
        "User-Agent" => "JotChain/1.0"
      }
    end

    def perform_request(method, url, options)
      HTTParty.send(method, url, options)
    end

    def handle_response(response, method, path, params, body, retry_count)
      case response.code
      when 200..299
        Response.new(
          data: parse_json(response.body),
          headers: response.headers.to_h,
          status: response.code
        )
      when 401
        raise AuthenticationError, "GitHub API authentication failed"
      when 403
        if response.headers["x-ratelimit-remaining"]&.to_i == 0
          handle_rate_limit(response, method, path, params, body, retry_count)
        else
          raise Error, "GitHub API forbidden: #{extract_error_message(response)}"
        end
      when 404
        raise NotFoundError, "GitHub resource not found: #{path}"
      when 422
        raise Error, "GitHub API validation error: #{extract_error_message(response)}"
      when 500..599
        handle_server_error(response, method, path, params, body, retry_count)
      else
        raise Error, "GitHub API error (#{response.code}): #{extract_error_message(response)}"
      end
    end

    def handle_rate_limit(response, method, path, params, body, retry_count)
      reset_time = Time.at(response.headers["x-ratelimit-reset"].to_i)
      wait_seconds = [(reset_time - Time.current).ceil, 60].min # Cap at 60 seconds

      if wait_seconds > 0 && retry_count < MAX_RETRIES
        Rails.logger.warn("GitHub rate limit hit, waiting #{wait_seconds}s")
        sleep(wait_seconds)
        request(method, path, params: params, body: body, retry_count: retry_count + 1)
      else
        raise RateLimitError, "GitHub API rate limit exceeded. Resets at #{reset_time}"
      end
    end

    def handle_server_error(response, method, path, params, body, retry_count)
      if retry_count < MAX_RETRIES
        delay = RETRY_DELAY * (2 ** retry_count) # Exponential backoff
        Rails.logger.warn("GitHub server error (#{response.code}), retrying in #{delay}s")
        sleep(delay)
        request(method, path, params: params, body: body, retry_count: retry_count + 1)
      else
        raise Error, "GitHub API server error after #{MAX_RETRIES} retries: #{response.code}"
      end
    end

    def sleep_until_reset(reset_time)
      return unless reset_time

      wait = [(reset_time - Time.current).ceil, 60].min
      if wait > 0
        Rails.logger.info("Rate limit low, sleeping #{wait}s until reset")
        sleep(wait)
      end
    end

    def parse_json(body)
      return {} if body.blank?

      JSON.parse(body)
    rescue JSON::ParserError
      {}
    end

    def extract_error_message(response)
      data = parse_json(response.body)
      data["message"] || response.body
    end
  end
end
