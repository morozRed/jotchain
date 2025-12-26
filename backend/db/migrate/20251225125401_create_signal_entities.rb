# frozen_string_literal: true

class CreateSignalEntities < ActiveRecord::Migration[8.0]
  def change
    create_table :signal_entities, id: :uuid do |t|
      t.uuid :signal_id, null: false
      t.string :entity_type, null: false
      t.string :name, null: false
      t.string :mentionable_type
      t.uuid :mentionable_id
      t.integer :count, default: 1
      t.datetime :last_seen_at

      t.timestamps

      t.index :signal_id
      t.index [:mentionable_type, :mentionable_id]
    end

    add_foreign_key :signal_entities, :signals, on_delete: :cascade
  end
end
