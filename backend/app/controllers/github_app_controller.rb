# frozen_string_literal: true

class GitHubAppController < ApplicationController
  # GET /github/install
  # Redirects the user to GitHub to install the app
  def install
    unless GitHubApp.configured?
      flash[:error] = "GitHub integration is not configured"
      redirect_to settings_integrations_path and return
    end

    # Store workspace ID in session for callback
    session[:github_install_workspace_id] = Current.workspace.id

    # Redirect to GitHub App installation page
    redirect_to GitHubApp.installation_url, allow_other_host: true
  end

  # GET /github/callback
  # Handles the callback from GitHub after installation
  def callback
    installation_id = params[:installation_id]
    setup_action = params[:setup_action]

    if installation_id.blank?
      flash[:error] = "GitHub installation failed - no installation ID received"
      redirect_to settings_integrations_path and return
    end

    workspace_id = session.delete(:github_install_workspace_id) || Current.workspace.id

    workspace = Current.user.workspaces.find_by(id: workspace_id)
    unless workspace
      flash[:error] = "Workspace not found"
      redirect_to settings_integrations_path and return
    end

    # Check if user has permission to install
    membership = workspace.workspace_memberships.find_by(user: Current.user)
    unless membership&.can_install_integrations?
      flash[:error] = "You don't have permission to install integrations for this workspace"
      redirect_to settings_integrations_path and return
    end

    # Fetch installation details from GitHub
    installation_data = fetch_installation_details(installation_id)

    unless installation_data
      flash[:error] = "Failed to fetch installation details from GitHub"
      redirect_to settings_integrations_path and return
    end

    # Check if installation already exists (re-installation)
    existing = GitHubInstallation.find_by(installation_id: installation_id)
    if existing
      if existing.workspace_id == workspace.id
        # Same workspace - update it
        update_installation(existing, installation_data)
        flash[:notice] = "GitHub installation updated successfully"
      else
        # Different workspace - error
        flash[:error] = "This GitHub account is already connected to another workspace"
      end
      redirect_to settings_integrations_path and return
    end

    # Create new installation
    installation = create_installation(workspace, installation_id, installation_data)

    if installation.persisted?
      # Sync repositories in the background
      SyncGithubRepositoriesJob.perform_later(installation.id) if defined?(SyncGithubRepositoriesJob)
      flash[:notice] = "GitHub successfully connected! Syncing repositories..."
    else
      flash[:error] = "Failed to save GitHub installation: #{installation.errors.full_messages.join(', ')}"
    end

    redirect_to settings_integrations_path
  end

  # DELETE /github/installations/:id
  # Removes a GitHub installation from the workspace
  def destroy
    installation = Current.workspace.github_installations.find(params[:id])

    membership = Current.workspace.workspace_memberships.find_by(user: Current.user)
    unless membership&.can_install_integrations?
      flash[:error] = "You don't have permission to remove integrations"
      redirect_to settings_integrations_path and return
    end

    installation.destroy
    flash[:notice] = "GitHub installation removed"
    redirect_to settings_integrations_path
  rescue ActiveRecord::RecordNotFound
    flash[:error] = "Installation not found"
    redirect_to settings_integrations_path
  end

  private

  def fetch_installation_details(installation_id)
    return nil unless GitHubApp.configured?

    response = HTTParty.get(
      "https://api.github.com/app/installations/#{installation_id}",
      headers: {
        "Authorization" => "Bearer #{GitHubApp.jwt}",
        "Accept" => "application/vnd.github+json",
        "X-GitHub-Api-Version" => "2022-11-28"
      }
    )

    response.success? ? response.parsed_response : nil
  rescue => e
    Rails.logger.error("Failed to fetch GitHub installation: #{e.message}")
    nil
  end

  def create_installation(workspace, installation_id, data)
    workspace.github_installations.create(
      installation_id: installation_id,
      account_login: data["account"]["login"],
      account_type: data["account"]["type"],
      account_id: data["account"]["id"],
      target_type: data["target_type"],
      permissions: data["permissions"] || {},
      events: data["events"] || [],
      repository_selection: data["repository_selection"],
      suspended_at: data["suspended_at"] ? Time.parse(data["suspended_at"]) : nil
    )
  end

  def update_installation(installation, data)
    installation.update(
      account_login: data["account"]["login"],
      permissions: data["permissions"] || {},
      events: data["events"] || [],
      repository_selection: data["repository_selection"],
      suspended_at: data["suspended_at"] ? Time.parse(data["suspended_at"]) : nil
    )
  end
end
