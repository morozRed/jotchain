# frozen_string_literal: true

class Settings::IntegrationsController < InertiaController
  def show
    render inertia: "settings/integrations/index", props: {
      workspace: workspace_props,
      installations: installations_props,
      githubConfigured: GitHubApp.configured?,
      canManageIntegrations: can_manage_integrations?
    }
  end

  private

  def workspace_props
    {
      id: Current.workspace.id,
      name: Current.workspace.name,
      slug: Current.workspace.slug
    }
  end

  def installations_props
    Current.workspace.github_installations.includes(:github_repositories).map do |installation|
      {
        id: installation.id,
        accountLogin: installation.account_login,
        accountType: installation.account_type,
        repositorySelection: installation.repository_selection,
        suspended: installation.suspended?,
        repositories: installation.github_repositories.map do |repo|
          {
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            syncEnabled: repo.sync_enabled,
            lastSyncedAt: repo.last_synced_at&.iso8601
          }
        end,
        createdAt: installation.created_at.iso8601
      }
    end
  end

  def can_manage_integrations?
    Current.workspace_membership&.can_install_integrations? || false
  end
end
