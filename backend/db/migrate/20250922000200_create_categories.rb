class CreateCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :categories, id: :uuid do |t|
      t.uuid :user_id
      t.string :name, null: false
      t.timestamps
    end

    add_index :categories, :user_id
    # Uniqueness per user will be enforced at the app layer initially; for
    # deterministic encryption + blind index we will add a unique index later.
  end
end

