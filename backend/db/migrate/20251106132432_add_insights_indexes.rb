# frozen_string_literal: true

class AddInsightsIndexes < ActiveRecord::Migration[8.0]
  def change
    # Composite index for entries - optimize date range queries by user
    add_index :entries, [:user_id, :logged_at], name: "index_entries_on_user_and_logged_at", unless_index_exists?: {name: "index_entries_on_user_and_logged_at"}

    # Composite indexes for entry_mentions - optimize insights queries
    add_index :entry_mentions, [:entry_id, :mentionable_type, :mentionable_id], name: "index_entry_mentions_composite", unless_index_exists?: {name: "index_entry_mentions_composite"}
    add_index :entry_mentions, [:mentionable_type, :mentionable_id], name: "index_entry_mentions_on_mentionable", unless_index_exists?: {name: "index_entry_mentions_on_mentionable"}
  end
end
