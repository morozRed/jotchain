# frozen_string_literal: true

class CreateGithubIssues < ActiveRecord::Migration[8.0]
  def change
    create_table :github_issues, id: :uuid do |t|
      t.uuid :github_repository_id, null: false
      t.uuid :author_id                       # GitHubContributor
      t.bigint :github_id, null: false        # GitHub issue ID
      t.integer :number, null: false          # Issue number in repo
      t.string :title, null: false
      t.text :body
      t.string :state, null: false            # open, closed
      t.string :state_reason                  # completed, not_planned, reopened
      t.datetime :opened_at, null: false
      t.datetime :closed_at
      t.jsonb :labels, default: []

      t.timestamps

      t.index [:github_repository_id, :github_id], unique: true
      t.index [:github_repository_id, :number], unique: true
      t.index :author_id
      t.index :state
      t.index :opened_at
      t.index [:github_repository_id, :state]
    end

    add_foreign_key :github_issues, :github_repositories, on_delete: :cascade
    add_foreign_key :github_issues, :github_contributors, column: :author_id, on_delete: :nullify
  end
end
