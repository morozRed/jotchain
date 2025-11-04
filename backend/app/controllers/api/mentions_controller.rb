# frozen_string_literal: true

module Api
  class MentionsController < Api::BaseController
    # GET /api/mentions?q=backend
    # Returns combined list of projects and persons matching the query
    def index
      query = params[:q].to_s.downcase
      limit = (params[:limit] || 5).to_i

      projects = search_projects(query).take(limit)
      persons = search_persons(query).take(limit)

      render json: {
        projects: projects.map { |p| mention_item(p, "project") },
        persons: persons.map { |p| mention_item(p, "person") }
      }
    end

    private

    def search_projects(query)
      return Current.user.projects.alphabetical if query.blank?

      # Note: This loads all projects into memory for search since names are encrypted
      # For better performance with many records, consider using deterministic encryption
      Current.user.projects.alphabetical.select do |project|
        project.name.downcase.include?(query)
      end
    end

    def search_persons(query)
      return Current.user.persons.alphabetical if query.blank?

      Current.user.persons.alphabetical.select do |person|
        person.name.downcase.include?(query)
      end
    end

    def mention_item(record, type)
      {
        id: record.id,
        type: type,
        label: record.name,
        color: type == "project" ? record.color : nil
      }
    end
  end
end
