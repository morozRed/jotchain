# frozen_string_literal: true

class WorkspaceMembership < ApplicationRecord
  belongs_to :workspace
  belongs_to :user

  enum :role, { member: 0, admin: 1, owner: 2 }

  validates :role, presence: true
  validates :user_id, uniqueness: { scope: :workspace_id, message: "is already a member of this workspace" }
  validate :single_owner, if: :owner?

  scope :for_workspace, ->(workspace) { where(workspace: workspace) }

  def can_manage_members?
    admin? || owner?
  end

  def can_manage_settings?
    admin? || owner?
  end

  def can_install_integrations?
    admin? || owner?
  end

  def can_delete_workspace?
    owner?
  end

  private

  def single_owner
    existing_owner = workspace.workspace_memberships.owner.where.not(id: id).exists?
    errors.add(:role, "workspace already has an owner") if existing_owner
  end
end
