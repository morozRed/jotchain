# frozen_string_literal: true

class CreateEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :entries, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.text :body, null: false
      t.string :tag
      t.datetime :logged_at, null: false

      t.timestamps
    end

    add_index :entries, [:user_id, :logged_at]
    add_index :entries, [:user_id, :tag]
  end
end
