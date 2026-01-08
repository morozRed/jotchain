# frozen_string_literal: true

class GitHubRepository < ApplicationRecord
  belongs_to :github_installation

  validates :github_id, presence: true, uniqueness: true
  validates :name, presence: true
  validates :full_name, presence: true

  scope :sync_enabled, -> { where(sync_enabled: true) }
  scope :needs_sync, -> { sync_enabled.where("last_synced_at IS NULL OR last_synced_at < ?", 1.hour.ago) }

  delegate :workspace, to: :github_installation

  def owner
    full_name.split("/").first
  end

  def repo_name
    full_name.split("/").last
  end

  def github_url
    "https://github.com/#{full_name}"
  end

  def mark_synced!(metadata = {})
    update!(
      last_synced_at: Time.current,
      sync_metadata: sync_metadata.merge(metadata)
    )
  end

  def enable_sync!
    update!(sync_enabled: true)
  end

  def disable_sync!
    update!(sync_enabled: false)
  end
end
