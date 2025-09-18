class CreateEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :entries, id: :uuid do |t|
      t.uuid :user_id, null: false

      # Encrypted fields
      t.text :content_ciphertext
      t.text :next_actions_ciphertext

      # Blind index for search
      t.string :content_bidx

      # Unencrypted metadata
      t.date :entry_date, null: false
      t.boolean :is_win, default: false
      t.string :win_level

      t.timestamps
    end

    add_index :entries, :user_id
    add_index :entries, [:user_id, :entry_date], unique: true
    add_index :entries, :entry_date
    add_index :entries, :is_win
    add_index :entries, :content_bidx
  end
end