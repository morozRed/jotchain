# frozen_string_literal: true

module Api
  class WorkspacesController < ApplicationController
    def index
      workspaces = Current.user.workspaces.includes(:workspace_memberships)

      render json: workspaces.map { |ws|
        membership = ws.workspace_memberships.find { |m| m.user_id == Current.user.id }
        {
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          role: membership&.role,
          memberCount: ws.workspace_memberships.count
        }
      }
    end

    def switch
      workspace = Current.user.workspaces.find(params[:id])
      Current.session.switch_workspace!(workspace)

      render json: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role: Current.workspace_membership&.role
      }
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Workspace not found" }, status: :not_found
    rescue ArgumentError => e
      render json: { error: e.message }, status: :forbidden
    end
  end
end
