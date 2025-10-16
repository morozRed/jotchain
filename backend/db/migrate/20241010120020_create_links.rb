class CreateLinks < ActiveRecord::Migration[8.0]
  def change
    create_table :links do |t|
      t.references :chain, null: false, foreign_key: true
      t.string :title
      t.text :body, null: false
      t.string :category, null: false, default: "note"
      t.date :recorded_on, null: false
      t.integer :sentiment, null: false, default: 0
      t.text :summary
      t.string :tags, array: true, default: [], null: false
      t.string :mentions, array: true, default: [], null: false
      t.integer :linked_chain_ids, array: true, default: [], null: false
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end

    add_index :links, :recorded_on
    add_index :links, :category
    add_index :links, :tags, using: :gin
    add_index :links, :mentions, using: :gin
    add_index :links, :linked_chain_ids, using: :gin
  end
end
