# frozen_string_literal: true

module Insights
  class Quota
    DEFAULT_MONTHLY_LIMIT = 20

    def initialize(user:)
      @user = user
    end

    def monthly_limit
      DEFAULT_MONTHLY_LIMIT
    end

    def monthly_usage
      @monthly_usage ||= insight_scope.count
    end

    def remaining
      [monthly_limit - monthly_usage, 0].max
    end

    def limit_reached?
      monthly_usage >= monthly_limit
    end

    private

    attr_reader :user

    def insight_scope
      return InsightRequest.none unless user

      user.insight_requests.where(created_at: current_period)
    end

    def current_period
      start_of_month..end_of_month
    end

    def start_of_month
      Time.current.beginning_of_month
    end

    def end_of_month
      Time.current.end_of_month
    end
  end
end

