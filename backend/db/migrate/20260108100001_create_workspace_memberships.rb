# frozen_string_literal: true

class CreateWorkspaceMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :workspace_memberships, id: :uuid do |t|
      t.uuid :workspace_id, null: false
      t.uuid :user_id, null: false
      t.integer :role, default: 0, null: false

      t.timestamps

      t.index [:workspace_id, :user_id], unique: true
      t.index [:user_id, :workspace_id]
      t.index [:workspace_id, :role]
    end

    add_foreign_key :workspace_memberships, :workspaces, on_delete: :cascade
    add_foreign_key :workspace_memberships, :users, on_delete: :cascade
  end
end
