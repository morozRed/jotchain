# frozen_string_literal: true

class AddInsightsIndexes < ActiveRecord::Migration[8.0]
  def change
    # Composite index for entries - optimize date range queries by user
    add_index :entries, [:user_id, :logged_at], name: "index_entries_on_user_and_logged_at", if_not_exists: true

    # Composite indexes for entry_mentions - optimize analytics queries
    add_index :entry_mentions, [:entry_id, :mentionable_type, :mentionable_id], name: "index_entry_mentions_composite", if_not_exists: true
    add_index :entry_mentions, [:mentionable_type, :mentionable_id], name: "index_entry_mentions_on_mentionable", if_not_exists: true
  end
end
