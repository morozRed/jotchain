class AiUsageLog < ApplicationRecord
  belongs_to :user

  # Insight types
  INSIGHT_TYPES = {
    weekly_summary: 'weekly_summary',
    personal_update: 'personal_update',
    executive_summary: 'executive_summary',
    linkedin_post: 'linkedin_post',
    weekly_reflection: 'weekly_reflection',
    goal_progress: 'goal_progress',
    team_update: 'team_update'
  }.freeze

  # Validations
  validates :insight_type, presence: true, inclusion: { in: INSIGHT_TYPES.values }
  validates :tokens_used, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :this_month, -> { where(created_at: Time.current.beginning_of_month..Time.current.end_of_month) }
  scope :by_type, ->(type) { where(insight_type: type) }
  scope :recent, -> { order(created_at: :desc) }

  # Class methods
  def self.monthly_usage_for_user(user)
    user.ai_usage_logs.this_month.sum(:tokens_used)
  end

  def self.monthly_count_for_user(user)
    user.ai_usage_logs.this_month.count
  end

  def self.usage_by_type_for_user(user)
    user.ai_usage_logs
        .this_month
        .group(:insight_type)
        .sum(:tokens_used)
  end
end