# frozen_string_literal: true

FactoryBot.define do
  factory :person do
    association :user
    sequence(:name) { |n| "Person #{n}" }
  end
end
