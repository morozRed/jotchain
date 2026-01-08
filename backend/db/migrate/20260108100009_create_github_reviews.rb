# frozen_string_literal: true

class CreateGithubReviews < ActiveRecord::Migration[8.0]
  def change
    create_table :github_reviews, id: :uuid do |t|
      t.uuid :github_pull_request_id, null: false
      t.uuid :reviewer_id                     # GitHubContributor
      t.bigint :github_id, null: false        # GitHub review ID
      t.string :state, null: false            # approved, changes_requested, commented, dismissed
      t.text :body
      t.datetime :submitted_at, null: false

      t.timestamps

      t.index [:github_pull_request_id, :github_id], unique: true
      t.index :reviewer_id
      t.index :submitted_at
      t.index [:github_pull_request_id, :reviewer_id]
    end

    add_foreign_key :github_reviews, :github_pull_requests, on_delete: :cascade
    add_foreign_key :github_reviews, :github_contributors, column: :reviewer_id, on_delete: :nullify
  end
end
