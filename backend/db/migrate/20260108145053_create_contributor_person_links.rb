# frozen_string_literal: true

class CreateContributorPersonLinks < ActiveRecord::Migration[8.0]
  def change
    create_table :contributor_person_links, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.references :github_contributor, type: :uuid, null: false, foreign_key: true
      t.references :person, type: :uuid, null: false, foreign_key: { to_table: :persons }

      t.timestamps
    end

    # Each user can link each contributor to only one person
    add_index :contributor_person_links, [:user_id, :github_contributor_id], unique: true, name: "idx_contributor_person_links_user_contributor"
  end
end
