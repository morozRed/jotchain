# frozen_string_literal: true

class BackfillPersonalWorkspaces < ActiveRecord::Migration[8.0]
  def up
    User.find_each do |user|
      # Skip users who already have a workspace
      next if user.workspace_memberships.exists?

      # Generate a unique slug from email
      base_slug = user.email.split("@").first.parameterize
      slug = base_slug
      counter = 1

      while Workspace.exists?(slug: slug)
        slug = "#{base_slug}-#{counter}"
        counter += 1
      end

      # Create personal workspace
      workspace = Workspace.create!(
        name: "#{user.name}'s Workspace",
        slug: slug,
        owner: user
      )

      # Create owner membership
      WorkspaceMembership.create!(
        workspace: workspace,
        user: user,
        role: :owner
      )
    end
  end

  def down
    # Remove all workspaces that have exactly one membership (personal workspaces)
    Workspace.includes(:workspace_memberships).find_each do |workspace|
      workspace.destroy if workspace.workspace_memberships.count == 1
    end
  end
end
