# frozen_string_literal: true

class Settings::EntitiesController < InertiaController
  def index
    projects = Current.user.projects.alphabetical.map do |project|
      {
        id: project.id,
        name: project.name,
        color: project.color,
        entryCount: project.entries.count,
        personCount: project.persons.count,
        createdAt: project.created_at.iso8601
      }
    end

    persons = Current.user.persons.alphabetical.map do |person|
      {
        id: person.id,
        name: person.name,
        entryCount: person.entries.count,
        projectCount: person.projects.count,
        createdAt: person.created_at.iso8601
      }
    end

    render inertia: {projects: projects, persons: persons}
  end
end
