# frozen_string_literal: true

FactoryBot.define do
  factory :project do
    association :user
    sequence(:name) { |n| "Project #{n}" }
    color { "#FF5733" }
  end
end
