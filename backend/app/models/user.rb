class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :timeoutable

  # Associations
  has_many :entries, dependent: :destroy
  has_one :subscription, dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: true

  # Methods
  def has_active_subscription?
    subscription&.active?
  end

  def current_streak
    return 0 if entries.empty?

    streak = 0
    date = Date.current

    while entries.for_date(date).exists?
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
    entries.for_date(Date.current).first
  end

  def yesterdays_entry
    entries.for_date(Date.current - 1.day).first
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
end
