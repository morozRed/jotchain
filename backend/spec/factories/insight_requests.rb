# frozen_string_literal: true

FactoryBot.define do
  factory :insight_request do
    association :user
    sequence(:name) { |n| "Insight #{n}" }
    query_type { "summary" }
    date_range_start { 1.week.ago }
    date_range_end { Time.current }
    status { "pending" }
    project_ids { [] }
    person_ids { [] }
  end
end
