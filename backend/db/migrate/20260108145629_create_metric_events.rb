# frozen_string_literal: true

class CreateMetricEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :metric_events, id: :uuid do |t|
      t.string :event_type, null: false
      t.references :user, type: :uuid, null: true, foreign_key: true
      t.references :workspace, type: :uuid, null: true, foreign_key: true
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :metric_events, :event_type
    add_index :metric_events, [:workspace_id, :event_type, :created_at]
  end
end
