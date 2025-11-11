# frozen_string_literal: true

module Api
  class InsightsController < Api::BaseController
    def preview
      date_range_start = parse_date(params[:date_range_start])
      date_range_end = parse_date(params[:date_range_end])

      unless date_range_start && date_range_end
        return render json: {error: "Invalid date range"}, status: :bad_request
      end

      project_ids = Array(params[:project_ids]).reject(&:blank?)
      person_ids = Array(params[:person_ids]).reject(&:blank?)

      entries = fetch_filtered_entries(date_range_start..date_range_end, project_ids, person_ids)

      render json: {
        totalNotes: entries.size,
        breakdown: calculate_breakdown(entries, project_ids),
        topCollaborators: calculate_top_collaborators(entries)
      }
    end

    private

    def parse_date(date_string)
      return nil if date_string.blank?
      DateTime.parse(date_string)
    rescue ArgumentError
      nil
    end

    def fetch_filtered_entries(date_range, project_ids, person_ids)
      scope = Current.user.entries.for_period(date_range).includes(:mentioned_projects, :mentioned_persons)
      # Filter by projects if specified
      if project_ids.present? && !project_ids.include?("all")
        scope = scope.joins(:entry_mentions)
          .distinct
      end

      # Filter by persons if specified
      if person_ids.present? && !person_ids.include?("all")
        scope = scope.joins(:entry_mentions)
          .where(entry_mentions: {mentionable_type: "Person", mentionable_id: person_ids})
          .distinct
      end

      scope.recent_first
    end

    def calculate_breakdown(entries, project_ids)
      return {} if project_ids.blank? || project_ids.include?("all")

      projects = Current.user.projects.where(id: project_ids)
      breakdown = {}

      projects.each do |project|
        count = entries.count { |entry| entry.mentioned_projects.include?(project) }
        breakdown[project.name] = count if count > 0
      end

      breakdown
    end

    def calculate_top_collaborators(entries)
      person_counts = Hash.new(0)

      entries.each do |entry|
        entry.mentioned_persons.each do |person|
          person_counts[person.name] += 1
        end
      end

      person_counts
        .sort_by { |_name, count| -count }
        .first(5)
        .map { |name, count| {name: name, count: count} }
    end
  end
end
