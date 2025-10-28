# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :email, null: false, index: {unique: true}
      t.string :password_digest, null: false

      t.boolean :verified, null: false, default: false

      t.timestamps
    end
  end
end
