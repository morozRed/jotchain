# frozen_string_literal: true

module Api
  class ProjectPersonsController < Api::BaseController
    before_action :set_project

    # POST /api/projects/:project_id/persons
    def create
      person = Current.user.persons.find(params[:person_id])
      project_person = @project.project_persons.new(person: person)

      if project_person.save
        render json: {message: "Person added to project"}, status: :created
      else
        render_errors(project_person)
      end
    rescue ActiveRecord::RecordNotFound
      render_error("Person not found", status: :not_found)
    end

    # DELETE /api/projects/:project_id/persons/:id
    def destroy
      person = Current.user.persons.find(params[:id])
      project_person = @project.project_persons.find_by!(person: person)
      project_person.destroy

      head :no_content
    rescue ActiveRecord::RecordNotFound
      render_error("Person not found in this project", status: :not_found)
    end

    private

    def set_project
      @project = Current.user.projects.find(params[:project_id])
    rescue ActiveRecord::RecordNotFound
      render_error("Project not found", status: :not_found)
    end
  end
end
