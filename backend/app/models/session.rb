# frozen_string_literal: true

class Session < ApplicationRecord
  belongs_to :user
  belongs_to :current_workspace, class_name: "Workspace", optional: true

  before_create do
    self.user_agent = Current.user_agent
    self.ip_address = Current.ip_address
  end

  def workspace
    # Return current_workspace if set and user is still a member
    if current_workspace && user.workspaces.include?(current_workspace)
      current_workspace
    else
      # Fall back to user's first workspace (personal workspace)
      user.workspaces.first
    end
  end

  def switch_workspace!(workspace)
    raise ArgumentError, "User is not a member of this workspace" unless user.workspaces.include?(workspace)

    update!(current_workspace: workspace)
  end
end
