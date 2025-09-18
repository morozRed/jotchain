class AddWinDescriptionToEntries < ActiveRecord::Migration[8.0]
  def change
    add_column :entries, :win_description_ciphertext, :text
  end
end
