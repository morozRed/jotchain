# frozen_string_literal: true

class CreateEntryMentions < ActiveRecord::Migration[8.0]
  def change
    create_table :entry_mentions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :entry_id, null: false
      t.string :mentionable_type, null: false
      t.uuid :mentionable_id, null: false

      t.timestamps
    end

    add_index :entry_mentions, [:entry_id, :mentionable_type, :mentionable_id], unique: true, name: "index_entry_mentions_uniqueness"
    add_index :entry_mentions, [:mentionable_type, :mentionable_id], name: "index_entry_mentions_on_mentionable"
    add_index :entry_mentions, :entry_id
    add_foreign_key :entry_mentions, :entries
  end
end
