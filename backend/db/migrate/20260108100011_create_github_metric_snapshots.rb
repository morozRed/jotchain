# frozen_string_literal: true

class CreateGithubMetricSnapshots < ActiveRecord::Migration[8.0]
  def change
    create_table :github_metric_snapshots, id: :uuid do |t|
      t.uuid :workspace_id, null: false
      t.uuid :github_contributor_id             # null = team aggregate
      t.uuid :github_repository_id              # null = all repos
      t.string :period_type, null: false        # rolling_7d, rolling_14d, rolling_30d, weekly
      t.date :period_start, null: false
      t.date :period_end, null: false
      t.jsonb :metrics, default: {}, null: false
      t.datetime :computed_at, null: false

      t.timestamps

      # Unique constraint for each combination
      t.index [:workspace_id, :github_contributor_id, :github_repository_id, :period_type, :period_start],
              unique: true,
              name: "idx_metric_snapshots_unique"

      t.index [:workspace_id, :period_type, :period_end]
      t.index [:github_contributor_id, :period_type]
      t.index [:github_repository_id, :period_type]
      t.index :computed_at
    end

    add_foreign_key :github_metric_snapshots, :workspaces, on_delete: :cascade
    add_foreign_key :github_metric_snapshots, :github_contributors, on_delete: :cascade
    add_foreign_key :github_metric_snapshots, :github_repositories, on_delete: :cascade
  end
end
