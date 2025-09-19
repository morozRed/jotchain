class Subscription < ApplicationRecord
  belongs_to :user

  # Constants for plan names
  PLAN_FREE = 'free'
  PLAN_MONTHLY = 'monthly'
  PLAN_YEARLY = 'yearly'

  PLANS = {
    PLAN_FREE => {
      name: 'Free',
      price_cents: 0,
      features: {
        days_of_history: 3,
        ai_insights: false,
        export: false,
        unlimited_entries: true
      }
    },
    PLAN_MONTHLY => {
      name: 'Pro Monthly',
      price_cents: 500,
      features: {
        days_of_history: nil, # unlimited
        ai_insights: true,
        export: true,
        unlimited_entries: true
      }
    },
    PLAN_YEARLY => {
      name: 'Pro Yearly',
      price_cents: 5000,
      features: {
        days_of_history: nil, # unlimited
        ai_insights: true,
        export: true,
        unlimited_entries: true
      }
    }
  }.freeze

  # Statuses
  ACTIVE_STATUSES = %w[active trialing].freeze

  # Validations
  validates :plan_name, inclusion: { in: PLANS.keys }
  validates :status, presence: true

  # Scopes
  scope :active, -> { where(status: ACTIVE_STATUSES) }
  scope :canceled, -> { where(status: 'canceled') }
  scope :past_due, -> { where(status: 'past_due') }

  # Callbacks
  before_validation :set_defaults, on: :create

  def active?
    status.in?(ACTIVE_STATUSES)
  end

  def free?
    plan_name == PLAN_FREE
  end

  def pro?
    plan_name.in?([PLAN_MONTHLY, PLAN_YEARLY])
  end

  def canceled?
    status == 'canceled' || cancel_at_period_end?
  end

  def past_due?
    status == 'past_due'
  end

  def days_of_history_allowed
    PLANS.dig(plan_name, :features, :days_of_history)
  end

  def ai_insights_allowed?
    PLANS.dig(plan_name, :features, :ai_insights) || false
  end

  def export_allowed?
    PLANS.dig(plan_name, :features, :export) || false
  end

  def unlimited_history?
    days_of_history_allowed.nil? && !free?
  end

  def plan_display_name
    PLANS.dig(plan_name, :name) || plan_name.humanize
  end

  def renewal_date
    return nil if free? || canceled?
    current_period_end
  end

  private

  def set_defaults
    self.plan_name ||= PLAN_FREE
    self.status ||= free? ? 'active' : 'inactive'
  end
end