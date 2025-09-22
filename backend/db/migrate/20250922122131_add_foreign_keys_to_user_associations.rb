class AddForeignKeysToUserAssociations < ActiveRecord::Migration[8.0]
  def change
    # Add foreign key constraints
    add_foreign_key :categories, :users
    add_foreign_key :entries, :users
    add_foreign_key :entries, :categories
  end
end
