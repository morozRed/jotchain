# frozen_string_literal: true

class AddBodyFormatToEntries < ActiveRecord::Migration[8.0]
  def change
    add_column :entries, :body_format, :string, default: "tiptap", null: false

    # Set existing entries to "plain" format
    reversible do |dir|
      dir.up do
        execute "UPDATE entries SET body_format = 'plain' WHERE body_format = 'tiptap'"
      end
    end
  end
end
