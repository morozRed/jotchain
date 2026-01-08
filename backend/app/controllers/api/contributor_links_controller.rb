# frozen_string_literal: true

module Api
  class ContributorLinksController < Api::BaseController
    before_action :set_contributor, only: [:show, :create, :destroy]

    def show
      link = Current.user.contributor_person_links.find_by(github_contributor: @contributor)

      if link
        render json: {
          id: link.id,
          contributorId: link.github_contributor_id,
          person: {
            id: link.person.id,
            name: link.person.name
          }
        }
      else
        render json: { linked: false }
      end
    end

    def create
      person = Current.user.persons.find(params[:person_id])

      link = Current.user.contributor_person_links.find_or_initialize_by(
        github_contributor: @contributor
      )
      link.person = person

      if link.save
        render json: {
          id: link.id,
          contributorId: link.github_contributor_id,
          person: {
            id: link.person.id,
            name: link.person.name
          }
        }, status: link.previously_new_record? ? :created : :ok
      else
        render_errors(link)
      end
    end

    def destroy
      link = Current.user.contributor_person_links.find_by!(github_contributor: @contributor)
      link.destroy
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render_error("Link not found", status: :not_found)
    end

    private

    def set_contributor
      @contributor = Current.workspace.github_contributors.find(params[:contributor_id])
    rescue ActiveRecord::RecordNotFound
      render_error("Contributor not found", status: :not_found)
    end
  end
end
