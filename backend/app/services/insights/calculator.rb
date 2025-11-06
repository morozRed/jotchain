# frozen_string_literal: true

module Insights
  class Calculator
    def initialize(user:, range:, project: nil, timezone: "UTC")
      @user = user
      @range = range
      @project = project
      @timezone = ActiveSupport::TimeZone[timezone] || Time.zone
    end

    def call
      {
        meta: meta_data,
        cards: cards_data,
        activity: activity_data,
        rolling7: rolling_average_data,
        heatmap: heatmap_data,
        hourly: hourly_data,
        dow: day_of_week_data,
        projects: projects_data,
        people: people_data,
        needsAttention: needs_attention_data
      }
    end

    private

    attr_reader :user, :range, :project, :timezone

    def meta_data
      {
        range: range.to_s,
        projectId: project&.id,
        tz: timezone.name,
        from: period_start.to_date.iso8601,
        to: period_end.to_date.iso8601
      }
    end

    def cards_data
      total = filtered_entries.count
      active_days_count = active_days.size
      avg_per_active = active_days_count > 0 ? (total.to_f / active_days_count).round(1) : 0.0

      {
        totalEntries: total,
        activeDays: active_days_count,
        currentStreak: current_streak,
        longestStreak: longest_streak,
        avgPerActiveDay: avg_per_active,
        focusScore: focus_score,
        untaggedShare: untagged_share
      }
    end

    def activity_data
      entries_by_date.map do |date, count|
        {date: date.iso8601, count: count}
      end
    end

    def rolling_average_data
      return [] if %i[week].include?(range)

      dates = entries_by_date.keys.sort
      return [] if dates.size < 7

      dates.each_cons(7).map do |window|
        counts = window.map { |d| entries_by_date[d] }
        avg = (counts.sum.to_f / 7).round(1)
        {date: window.last.iso8601, count: avg}
      end
    end

    def heatmap_data
      # Same as activity for MVP
      activity_data
    end

    def hourly_data
      # Group entries by hour of day in user's timezone
      hours = Hash.new(0)

      filtered_entries.each do |entry|
        hour = entry.logged_at.in_time_zone(timezone).hour
        hours[hour] += 1
      end

      (0..23).map do |hour|
        {hour: hour, count: hours[hour]}
      end
    end

    def day_of_week_data
      # Group by ISO day of week (1=Monday, 7=Sunday)
      days = Hash.new(0)

      filtered_entries.each do |entry|
        dow = entry.logged_at.in_time_zone(timezone).to_date.cwday
        days[dow] += 1
      end

      (1..7).map do |dow|
        {isoDow: dow, count: days[dow]}
      end
    end

    def projects_data
      # Get project breakdown
      project_counts = Hash.new(0)

      if project.present?
        # If filtering by a project, show breakdown of just that project
        project_counts[project.id] = filtered_entries.count
        top_projects = [{
          id: project.id,
          name: project.name,
          count: project_counts[project.id],
          share: 1.0
        }]
        other_count = 0
      else
        # Get all project mentions in filtered entries
        entry_ids = filtered_entries.pluck(:id)
        mentions = EntryMention.where(entry_id: entry_ids, mentionable_type: "Project")
                              .group(:mentionable_id)
                              .count

        mentions.each do |project_id, count|
          project_counts[project_id] = count
        end

        total = project_counts.values.sum
        sorted_projects = project_counts.sort_by { |_id, count| -count }
        top_10 = sorted_projects.take(10)
        rest = sorted_projects.drop(10)

        top_projects = top_10.map do |project_id, count|
          proj = user.projects.find_by(id: project_id)
          next unless proj

          {
            id: proj.id,
            name: proj.name,
            count: count,
            share: total > 0 ? (count.to_f / total).round(3) : 0.0
          }
        end.compact

        other_count = rest.sum { |_id, count| count }
      end

      {
        top: top_projects,
        otherCount: other_count,
        focusScore: focus_score,
        stale: stale_projects
      }
    end

    def people_data
      # Get people mentions
      entry_ids = filtered_entries.pluck(:id)
      mentions = EntryMention.where(entry_id: entry_ids, mentionable_type: "Person")
                            .group(:mentionable_id)
                            .count

      total = mentions.values.sum
      sorted_people = mentions.sort_by { |_id, count| -count }
      top_10 = sorted_people.take(10)
      rest = sorted_people.drop(10)

      top_people = top_10.map do |person_id, count|
        person = user.persons.find_by(id: person_id)
        next unless person

        {
          id: person.id,
          name: person.name,
          count: count
        }
      end.compact

      {
        top: top_people,
        otherCount: rest.sum { |_id, count| count }
      }
    end

    def needs_attention_data
      {
        staleProjects: stale_projects,
        untaggedShare: untagged_share
      }
    end

    def stale_projects
      return [] if project.present? # Don't show stale when filtering by project

      # Find projects that haven't been mentioned in a while
      all_projects = user.projects.includes(:entry_mentions)
      today = Time.current.in_time_zone(timezone).to_date

      stale = []
      all_projects.each do |proj|
        last_mention = proj.entry_mentions
                          .joins(:entry)
                          .where(entries: {user_id: user.id})
                          .maximum("entries.logged_at")

        if last_mention
          days_since = (today - last_mention.in_time_zone(timezone).to_date).to_i
          if days_since > 7 # Consider stale if more than 7 days
            stale << {
              projectId: proj.id,
              name: proj.name,
              daysSinceLast: days_since
            }
          end
        end
      end

      stale.sort_by { |p| -p[:daysSinceLast] }.take(3)
    end

    def focus_score
      return 0 if project.present? # Focus score only makes sense for all projects

      entry_ids = filtered_entries.pluck(:id)
      project_counts = EntryMention.where(entry_id: entry_ids, mentionable_type: "Project")
                                  .group(:mentionable_id)
                                  .count

      total = project_counts.values.sum.to_f
      return 0 if total == 0

      # Herfindahl index: sum of squared shares
      h_index = project_counts.values.sum { |count| (count / total)**2 }
      (h_index * 100).round
    end

    def untagged_share
      total = filtered_entries.count
      return 0.0 if total == 0

      untagged = filtered_entries.left_joins(:entry_mentions)
                                .where(entry_mentions: {id: nil})
                                .where(mentionable_type: "Project")
                                .or(filtered_entries.where.not(id: EntryMention.where(mentionable_type: "Project").select(:entry_id)))
                                .distinct
                                .count

      (untagged.to_f / total).round(3)
    end

    # Streak calculations
    def current_streak
      return user_current_streak if project.nil?

      # Calculate streak for filtered entries
      calculate_streak(all_dates_with_entries, Time.current.in_time_zone(timezone).to_date)
    end

    def longest_streak
      dates = all_dates_with_entries
      return 0 if dates.empty?

      max_streak = 0
      current = 1

      dates.each_cons(2) do |prev, curr|
        if (curr - prev).to_i == 1
          current += 1
        else
          max_streak = [max_streak, current].max
          current = 1
        end
      end

      [max_streak, current].max
    end

    def calculate_streak(dates, end_date)
      return 0 if dates.empty?

      dates = dates.sort.reverse
      streak = 0
      expected_date = end_date

      dates.each do |date|
        if date == expected_date
          streak += 1
          expected_date -= 1.day
        elsif date < expected_date
          break
        end
      end

      streak
    end

    # Helper methods
    def period_start
      case range
      when :week
        7.days.ago.in_time_zone(timezone).beginning_of_day
      when :month
        1.month.ago.in_time_zone(timezone).beginning_of_day
      when :year
        1.year.ago.in_time_zone(timezone).beginning_of_day
      end
    end

    def period_end
      Time.current.in_time_zone(timezone).end_of_day
    end

    def base_entries
      user.entries.where(logged_at: period_start..period_end)
    end

    def filtered_entries
      @filtered_entries ||= begin
        entries = base_entries
        if project.present?
          entries = entries.joins(:entry_mentions)
                          .where(entry_mentions: {mentionable_type: "Project", mentionable_id: project.id})
                          .distinct
        end
        entries
      end
    end

    def entries_by_date
      @entries_by_date ||= begin
        counts = Hash.new(0)
        filtered_entries.each do |entry|
          date = entry.logged_at.in_time_zone(timezone).to_date
          counts[date] += 1
        end
        counts
      end
    end

    def active_days
      entries_by_date.keys
    end

    def all_dates_with_entries
      filtered_entries.pluck(:logged_at).map { |t| t.in_time_zone(timezone).to_date }.uniq.sort
    end

    def user_current_streak
      # Use the User model's method if available
      user.respond_to?(:current_streak) ? user.current_streak : 0
    end
  end
end
