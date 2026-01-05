# frozen_string_literal: true

class CreateSignals < ActiveRecord::Migration[8.0]
  def change
    create_table :signals, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :signal_type, null: false
      t.string :entity_name, null: false
      t.string :status, default: "active", null: false
      t.string :title, null: false
      t.integer :confidence, default: 0, null: false
      t.datetime :first_detected_at, null: false
      t.datetime :last_detected_at, null: false
      t.datetime :seen_at
      t.string :source, default: "ai", null: false
      t.jsonb :metadata, default: {}
      t.jsonb :context_payload, default: {}

      t.timestamps

      t.index [:user_id, :entity_name, :signal_type], unique: true, name: "index_signals_unique_pattern"
      t.index [:user_id, :status]
      t.index [:user_id, :signal_type, :status]
      t.index :last_detected_at
    end

    add_foreign_key :signals, :users
  end
end
