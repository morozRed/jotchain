class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :timeoutable

  # Associations
  has_many :entries, dependent: :destroy
  has_one :subscription, dependent: :destroy
  has_many :ai_usage_logs, dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: true

  # Callbacks
  after_create :create_default_subscription

  # Methods
  def has_active_subscription?
    subscription&.active? || false
  end

  def subscription_plan
    subscription&.plan_name || 'free'
  end

  def can_access_entries_before?(date)
    return true if subscription&.unlimited_history?

    days_allowed = subscription&.days_of_history_allowed || 3
    date >= days_allowed.days.ago.to_date
  end

  def can_use_ai_insights?
    subscription&.ai_insights_allowed? || false
  end

  def can_export?
    subscription&.export_allowed? || false
  end

  def ai_usage_this_month
    AiUsageLog.monthly_count_for_user(self)
  end

  def accessible_entries
    if subscription&.unlimited_history?
      entries
    else
      days_allowed = subscription&.days_of_history_allowed || 3
      entries.where('entry_date >= ?', days_allowed.days.ago.to_date)
    end
  end

  def current_streak
    return 0 if entries.empty?

    streak = 0
    date = Date.current

    while entries.where(entry_date: date).exists?
      streak += 1
      date -= 1.day
    end

    streak
  end

  def longest_streak
    return 0 if entries.empty?

    dates = entries.pluck(:entry_date).sort
    return 1 if dates.size == 1

    max_streak = 1
    current_streak = 1

    dates.each_cons(2) do |date1, date2|
      if (date2 - date1).to_i == 1
        current_streak += 1
        max_streak = [max_streak, current_streak].max
      else
        current_streak = 1
      end
    end

    max_streak
  end

  def todays_entry
    entries.where(entry_date: Date.current).first
  end

  def yesterdays_entry
    entries.where(entry_date: Date.current - 1.day).first
  end

  def recent_entries(limit = 6)
    entries.recent.limit(limit)
  end

  def total_wins
    entries.wins.count
  end

  def wins_by_level
    entries.wins.group(:win_level).count
  end

  private

  def create_default_subscription
    build_subscription(plan_name: 'free', status: 'active').save
  end
end
