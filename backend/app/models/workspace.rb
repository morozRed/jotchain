# frozen_string_literal: true

class Workspace < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :workspace_memberships, dependent: :destroy
  has_many :members, through: :workspace_memberships, source: :user

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/, message: "only allows lowercase letters, numbers, and hyphens" }

  before_validation :generate_slug, on: :create, if: -> { slug.blank? }

  normalizes :slug, with: -> { _1.strip.downcase }

  def owner_membership
    workspace_memberships.find_by(role: :owner)
  end

  def admins
    members.joins(:workspace_memberships).where(workspace_memberships: { role: [:admin, :owner] })
  end

  def transfer_ownership!(new_owner)
    raise ArgumentError, "New owner must be a member of the workspace" unless members.include?(new_owner)

    transaction do
      workspace_memberships.find_by(user: owner)&.update!(role: :admin)
      workspace_memberships.find_by(user: new_owner).update!(role: :owner)
      update!(owner: new_owner)
    end
  end

  private

  def generate_slug
    base_slug = name.parameterize
    slug_candidate = base_slug
    counter = 1

    while Workspace.exists?(slug: slug_candidate)
      slug_candidate = "#{base_slug}-#{counter}"
      counter += 1
    end

    self.slug = slug_candidate
  end
end
