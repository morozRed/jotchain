# frozen_string_literal: true

class CreateGithubCommits < ActiveRecord::Migration[8.0]
  def change
    create_table :github_commits, id: :uuid do |t|
      t.uuid :github_repository_id, null: false
      t.uuid :author_id                       # GitHubContributor (nullable for external authors)
      t.string :sha, null: false
      t.text :message
      t.datetime :committed_at, null: false
      t.integer :additions, default: 0
      t.integer :deletions, default: 0
      t.integer :files_changed, default: 0
      t.string :author_email
      t.string :author_name

      t.timestamps

      t.index [:github_repository_id, :sha], unique: true
      t.index :sha
      t.index :author_id
      t.index :committed_at
      t.index [:github_repository_id, :committed_at]
    end

    add_foreign_key :github_commits, :github_repositories, on_delete: :cascade
    add_foreign_key :github_commits, :github_contributors, column: :author_id, on_delete: :nullify
  end
end
