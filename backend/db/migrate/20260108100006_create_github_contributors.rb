# frozen_string_literal: true

class CreateGithubContributors < ActiveRecord::Migration[8.0]
  def change
    create_table :github_contributors, id: :uuid do |t|
      t.uuid :workspace_id, null: false
      t.bigint :github_id, null: false        # GitHub user ID
      t.string :login, null: false            # GitHub username
      t.string :name                          # Display name
      t.string :avatar_url
      t.string :email

      t.timestamps

      t.index [:workspace_id, :github_id], unique: true
      t.index [:workspace_id, :login]
      t.index :github_id
    end

    add_foreign_key :github_contributors, :workspaces, on_delete: :cascade
  end
end
