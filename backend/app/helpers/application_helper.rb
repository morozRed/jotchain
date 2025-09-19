module ApplicationHelper
  include Heroicon::Engine.helpers

  def generate_streak_data(user)
    # Get entries from the last 90 days (similar to JotChain's approach)
    start_date = Date.current - 90.days
    end_date = Date.current

    entries_by_date = user.entries
      .where(entry_date: start_date..end_date)
      .group(:entry_date)
      .count

    # Generate streak data with intensity levels (1-5) based on entry activity
    streak_data = []
    (start_date..end_date).each do |date|
      entry_count = entries_by_date[date] || 0

      # Calculate intensity based on entry activity
      # 0 = no entry, 1-5 = increasing levels of activity
      intensity = case entry_count
      when 0
        0
      when 1
        3  # Standard entry gets medium intensity
      else
        5  # Multiple entries or rich content gets max intensity
      end

      # Check if entry has win content for higher intensity
      if entry_count > 0
        entry = user.entries.find_by(entry_date: date)
        if entry&.is_win?
          intensity = 5  # Wins get maximum intensity
        elsif entry&.content.present? && entry.content.length > 200
          intensity = [intensity + 1, 5].min  # Long entries get higher intensity
        end
      end

      streak_data << {
        date: date.to_s,
        intensity: intensity
      }
    end

    streak_data
  end
end
