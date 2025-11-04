# frozen_string_literal: true

module Api
  class PersonsController < Api::BaseController
    before_action :set_person, only: [:show, :update, :destroy]

    def index
      persons = Current.user.persons.alphabetical

      if params[:q].present?
        # Simple search by name (works with encrypted fields after decryption)
        persons = persons.select { |p| p.name.downcase.include?(params[:q].downcase) }
      end

      render json: persons.map { |person| person_json(person) }
    end

    def show
      render json: person_json(@person)
    end

    def create
      person = Current.user.persons.new(person_params)

      if person.save
        render json: person_json(person), status: :created
      else
        render_errors(person)
      end
    end

    def update
      if @person.update(person_params)
        render json: person_json(@person)
      else
        render_errors(@person)
      end
    end

    def destroy
      @person.destroy
      head :no_content
    end

    private

    def set_person
      @person = Current.user.persons.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render_error("Person not found", status: :not_found)
    end

    def person_params
      params.require(:person).permit(:name)
    end

    def person_json(person)
      {
        id: person.id,
        name: person.name,
        projectCount: person.projects.count,
        entryCount: person.entries.count,
        createdAt: person.created_at.iso8601
      }
    end
  end
end
