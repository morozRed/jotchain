class CreateAiUsageLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_usage_logs, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :insight_type, null: false
      t.integer :tokens_used, default: 0
      t.json :metadata

      t.timestamps
    end

    add_index :ai_usage_logs, [:user_id, :created_at]
    add_index :ai_usage_logs, :insight_type
  end
end
