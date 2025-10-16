class CreateSpaces < ActiveRecord::Migration[8.0]
  def change
    create_table :spaces do |t|
      t.string :name, null: false
      t.string :slug
      t.string :color
      t.text :description

      t.timestamps
    end

    add_index :spaces, :slug, unique: true
  end
end
