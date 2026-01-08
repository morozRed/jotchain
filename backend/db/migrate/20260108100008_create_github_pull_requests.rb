# frozen_string_literal: true

class CreateGithubPullRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :github_pull_requests, id: :uuid do |t|
      t.uuid :github_repository_id, null: false
      t.uuid :author_id                       # GitHubContributor
      t.bigint :github_id, null: false        # GitHub PR ID
      t.integer :number, null: false          # PR number in repo
      t.string :title, null: false
      t.text :body
      t.string :state, null: false            # open, closed, merged
      t.boolean :draft, default: false
      t.integer :additions, default: 0
      t.integer :deletions, default: 0
      t.integer :changed_files, default: 0
      t.integer :commits_count, default: 0
      t.datetime :opened_at, null: false
      t.datetime :closed_at
      t.datetime :merged_at
      t.datetime :first_review_at
      t.string :merged_by_login
      t.string :head_ref
      t.string :base_ref

      t.timestamps

      t.index [:github_repository_id, :github_id], unique: true
      t.index [:github_repository_id, :number], unique: true
      t.index :author_id
      t.index :state
      t.index :opened_at
      t.index :merged_at
      t.index [:github_repository_id, :state]
      t.index [:github_repository_id, :opened_at]
    end

    add_foreign_key :github_pull_requests, :github_repositories, on_delete: :cascade
    add_foreign_key :github_pull_requests, :github_contributors, column: :author_id, on_delete: :nullify
  end
end
