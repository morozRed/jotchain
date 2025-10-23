# frozen_string_literal: true

FactoryBot.define do
  factory :entry do
    association :user
    body { "Wrapped up onboarding flow and crushed blocker bugs." }
    tag { "shipping" }
    logged_at { Time.current }
  end
end
