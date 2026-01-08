# frozen_string_literal: true

class CreateGithubRepositories < ActiveRecord::Migration[8.0]
  def change
    create_table :github_repositories, id: :uuid do |t|
      t.uuid :github_installation_id, null: false
      t.bigint :github_id, null: false        # GitHub's repository ID
      t.string :name, null: false             # Short name (e.g., "jotchain")
      t.string :full_name, null: false        # Full name (e.g., "org/jotchain")
      t.boolean :private, default: false
      t.string :default_branch, default: "main"
      t.string :language
      t.text :description
      t.boolean :sync_enabled, default: true
      t.datetime :last_synced_at
      t.jsonb :sync_metadata, default: {}     # Cursor, state, etc.

      t.timestamps

      t.index :github_id, unique: true
      t.index :github_installation_id
      t.index [:github_installation_id, :sync_enabled]
      t.index :full_name
    end

    add_foreign_key :github_repositories, :github_installations, on_delete: :cascade
  end
end
