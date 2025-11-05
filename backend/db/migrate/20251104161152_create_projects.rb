# frozen_string_literal: true

class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :user_id, null: false
      t.string :name, null: false
      t.string :color

      t.timestamps
    end

    add_index :projects, [:user_id, :name]
    add_index :projects, :user_id
    add_foreign_key :projects, :users
  end
end
