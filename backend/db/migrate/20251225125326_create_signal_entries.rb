# frozen_string_literal: true

class CreateSignalEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :signal_entries, id: :uuid do |t|
      t.uuid :signal_id, null: false
      t.uuid :entry_id, null: false
      t.string :role, default: "evidence", null: false
      t.text :excerpt
      t.float :score, default: 0.0

      t.timestamps

      t.index [:signal_id, :entry_id], unique: true
      t.index :entry_id
      t.index [:signal_id, :role]
    end

    add_foreign_key :signal_entries, :signals, on_delete: :cascade
    add_foreign_key :signal_entries, :entries, on_delete: :cascade
  end
end
