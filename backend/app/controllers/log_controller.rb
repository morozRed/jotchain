# frozen_string_literal: true

class LogController < InertiaController
  def index
    respond_to do |format|
      format.html do
        render inertia: "log/index", props: {
          entries: entry_payloads,
          projects: project_options,
          persons: person_options,
          filters: current_filters,
          pagination: pagination_data
        }
      end
      format.json do
        render json: {
          entries: entry_payloads,
          pagination: pagination_data
        }
      end
    end
  end

  private

  def entries_scope
    scope = Current.user.entries.recent_first

    # Filter by project
    if params[:project_id].present?
      project = Current.user.projects.find_by(id: params[:project_id])
      scope = scope.mentioning_project(project) if project
    end

    # Filter by person
    if params[:person_id].present?
      person = Current.user.persons.find_by(id: params[:person_id])
      scope = scope.mentioning_person(person) if person
    end

    # Search in body (basic text search)
    if params[:q].present?
      # Since body is encrypted, we'll need to load all and filter
      # For now, skip text search on encrypted fields
    end

    scope
  end

  def entry_payloads
    entries_scope.limit(50).offset(offset).map do |entry|
      {
        id: entry.id,
        body: entry.body_with_deleted_mentions_marked,
        bodyFormat: entry.body_format,
        tag: entry.tag,
        loggedAt: entry.logged_at&.iso8601,
        loggedAtLabel: format_logged_at(entry.logged_at),
        createdAt: entry.created_at.iso8601,
        mentions: entry_mentions(entry)
      }
    end
  end

  def entry_mentions(entry)
    {
      projects: entry.mentioned_projects.map { |p| {id: p.id, name: p.name, color: p.color} },
      persons: entry.mentioned_persons.map { |p| {id: p.id, name: p.name} }
    }
  end

  def format_logged_at(logged_at)
    return nil unless logged_at

    date = logged_at.to_date
    if date == Date.current
      "Today at #{logged_at.strftime("%H:%M")}"
    elsif date == Date.yesterday
      "Yesterday at #{logged_at.strftime("%H:%M")}"
    elsif date > 7.days.ago.to_date
      logged_at.strftime("%A at %H:%M")
    else
      logged_at.strftime("%b %-d at %H:%M")
    end
  end

  def project_options
    Current.user.projects.alphabetical.map do |project|
      {id: project.id, name: project.name, color: project.color}
    end
  end

  def person_options
    Current.user.persons.alphabetical.map do |person|
      {id: person.id, name: person.name}
    end
  end

  def current_filters
    {
      projectId: params[:project_id].present? ? params[:project_id].to_i : nil,
      personId: params[:person_id].present? ? params[:person_id].to_i : nil,
      q: params[:q]
    }
  end

  def pagination_data
    total = entries_scope.count
    {
      total: total,
      page: current_page,
      perPage: 50,
      hasMore: offset + 50 < total
    }
  end

  def current_page
    [(params[:page].to_i), 1].max
  end

  def offset
    (current_page - 1) * 50
  end
end
