# frozen_string_literal: true

class CreatePersons < ActiveRecord::Migration[8.0]
  def change
    create_table :persons, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :user_id, null: false
      t.string :name, null: false

      t.timestamps
    end

    add_index :persons, [:user_id, :name]
    add_index :persons, :user_id
    add_foreign_key :persons, :users
  end
end
