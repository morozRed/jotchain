# frozen_string_literal: true

class AddCurrentWorkspaceToSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :sessions, :current_workspace_id, :uuid
    add_index :sessions, :current_workspace_id
    add_foreign_key :sessions, :workspaces, column: :current_workspace_id, on_delete: :nullify
  end
end
