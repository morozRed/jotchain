# frozen_string_literal: true

class CreateProjectPersons < ActiveRecord::Migration[8.0]
  def change
    create_table :project_persons, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :project_id, null: false
      t.uuid :person_id, null: false

      t.timestamps
    end

    add_index :project_persons, [:project_id, :person_id], unique: true
    add_index :project_persons, :person_id
    add_foreign_key :project_persons, :projects
    add_foreign_key :project_persons, :persons
  end
end
