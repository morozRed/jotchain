class CreateEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :entries, id: :uuid do |t|
      t.uuid :user_id
      t.uuid :category_id
      t.date :entry_date, null: false
      t.text :day_log
      t.text :next_actions
      t.text :win
      t.timestamps
    end

    add_index :entries, [:user_id, :entry_date, :category_id], unique: true, name: "idx_entries_user_date_category"
    add_index :entries, :user_id
    add_index :entries, :category_id
  end
end

