class StreakGridComponent < ViewComponent::Base
  def initialize(user:)
    @user = user
    @today = Date.current
    @start_date = @today - 77.days
  end

  private

  attr_reader :user, :today, :start_date

  def days_by_weekday
    # Organize 90 days into rows by weekday (GitHub style)
    # Returns 7 arrays, one for each day of week
    days_grid = Array.new(7) { [] }

    current_date = start_date

    # Start from the nearest Sunday before start_date
    days_to_sunday = current_date.wday
    current_date -= days_to_sunday.days if days_to_sunday > 0

    # Fill the grid
    while current_date <= today
      7.times do |weekday|
        date = current_date + weekday.days
        if date >= start_date && date <= today
          days_grid[weekday] << date
        elsif date < start_date || date > today
          days_grid[weekday] << nil  # Placeholder for alignment
        end
      end
      current_date += 7.days
    end

    days_grid
  end

  def entries_by_date
    @entries_by_date ||= user.entries
      .where(entry_date: start_date..today)
      .pluck(:entry_date)
      .to_set
  end

  def day_class(date)
    classes = ["streak-day"]

    if date > today
      classes << "opacity-30 cursor-not-allowed"
    elsif date == today
      classes << (entries_by_date.include?(date) ? "streak-day-filled" : "streak-day-empty")
      classes << "streak-day-today"
    elsif entries_by_date.include?(date)
      classes << "streak-day-filled"
    else
      classes << "streak-day-empty"
    end

    classes.join(" ")
  end

  def day_title(date)
    if date > today
      "Future"
    elsif entries_by_date.include?(date)
      "Entry logged on #{date.strftime('%B %d')}"
    else
      "No entry on #{date.strftime('%B %d')}"
    end
  end

  def current_streak
    user.current_streak
  end

  def longest_streak
    user.longest_streak
  end
end
