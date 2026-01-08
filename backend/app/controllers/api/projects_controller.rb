# frozen_string_literal: true

module Api
  class ProjectsController < Api::BaseController
    before_action :set_project, only: [:show, :update, :destroy]

    def index
      projects = Current.user.projects.alphabetical

      if params[:q].present?
        # Simple search by name (works with encrypted fields after decryption)
        projects = projects.select { |p| p.name.downcase.include?(params[:q].downcase) }
      end

      render json: projects.map { |project| project_json(project) }
    end

    def show
      render json: project_json(@project)
    end

    def create
      project = Current.user.projects.new(project_params)

      if project.save
        render json: project_json(project), status: :created
      else
        render_errors(project)
      end
    end

    def update
      if @project.update(project_params)
        render json: project_json(@project)
      else
        render_errors(@project)
      end
    end

    def destroy
      @project.destroy
      head :no_content
    end

    private

    def set_project
      @project = Current.user.projects.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render_error("Project not found", status: :not_found)
    end

    def project_params
      params.require(:project).permit(:name, :color, :github_repository_id)
    end

    def project_json(project)
      {
        id: project.id,
        name: project.name,
        color: project.color,
        personCount: project.persons.count,
        entryCount: project.entries.count,
        createdAt: project.created_at.iso8601,
        githubRepository: project.github_repository ? {
          id: project.github_repository.id,
          name: project.github_repository.name,
          fullName: project.github_repository.full_name,
          githubUrl: project.github_repository.github_url
        } : nil
      }
    end
  end
end
