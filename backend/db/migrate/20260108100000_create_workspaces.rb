# frozen_string_literal: true

class CreateWorkspaces < ActiveRecord::Migration[8.0]
  def change
    create_table :workspaces, id: :uuid do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.uuid :owner_id, null: false
      t.jsonb :settings, default: {}

      t.timestamps

      t.index :slug, unique: true
      t.index :owner_id
    end

    add_foreign_key :workspaces, :users, column: :owner_id
  end
end
