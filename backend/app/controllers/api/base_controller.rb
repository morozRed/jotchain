# frozen_string_literal: true

module Api
  class BaseController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!

    private

    def authenticate_user!
      unless Current.user
        render json: {error: "Unauthorized"}, status: :unauthorized
      end
    end

    def render_error(message, status: :unprocessable_entity)
      render json: {error: message}, status: status
    end

    def render_errors(model)
      render json: {errors: model.errors.full_messages}, status: :unprocessable_entity
    end
  end
end
