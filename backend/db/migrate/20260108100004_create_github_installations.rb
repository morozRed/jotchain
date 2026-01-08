# frozen_string_literal: true

class CreateGithubInstallations < ActiveRecord::Migration[8.0]
  def change
    create_table :github_installations, id: :uuid do |t|
      t.uuid :workspace_id, null: false
      t.bigint :installation_id, null: false  # GitHub's installation ID
      t.string :account_login, null: false    # GitHub org/user login
      t.string :account_type, null: false     # 'Organization' or 'User'
      t.bigint :account_id, null: false       # GitHub account ID
      t.string :target_type                   # 'Organization', 'User', etc.
      t.jsonb :permissions, default: {}       # Granted permissions
      t.jsonb :events, default: []            # Subscribed events
      t.string :repository_selection          # 'all' or 'selected'
      t.datetime :suspended_at
      t.string :access_token                  # Installation access token (encrypted)
      t.datetime :access_token_expires_at

      t.timestamps

      t.index :installation_id, unique: true
      t.index :workspace_id
      t.index [:workspace_id, :account_login]
    end

    add_foreign_key :github_installations, :workspaces, on_delete: :cascade
  end
end
