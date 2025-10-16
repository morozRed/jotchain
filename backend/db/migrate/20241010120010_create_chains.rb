class CreateChains < ActiveRecord::Migration[8.0]
  def change
    create_table :chains do |t|
      t.references :space, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.string :purpose
      t.string :status, default: "active", null: false
      t.string :color
      t.integer :position

      t.timestamps
    end

    add_index :chains, %i[space_id position]
  end
end
