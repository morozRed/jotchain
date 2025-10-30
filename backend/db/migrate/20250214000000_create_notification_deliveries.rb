# frozen_string_literal: true

class CreateNotificationDeliveries < ActiveRecord::Migration[8.0]
  def change
    create_table :notification_deliveries, id: :uuid do |t|
      t.references :notification_schedule, null: false, type: :uuid, foreign_key: true, index: false
      t.references :user, null: false, type: :uuid, foreign_key: true, index: false
      t.datetime :occurrence_at, null: false
      t.datetime :trigger_at, null: false
      t.datetime :window_start, null: false
      t.datetime :window_end, null: false
      t.string :status, null: false, default: "pending"
      t.jsonb :summary_payload
      t.string :summary_model
      t.integer :prompt_tokens
      t.integer :completion_tokens
      t.text :error_message
      t.datetime :delivered_at

      t.timestamps
    end

    add_index :notification_deliveries, [:notification_schedule_id, :occurrence_at], unique: true, name: "index_notification_deliveries_on_schedule_and_occurrence"
    add_index :notification_deliveries, :trigger_at
    add_index :notification_deliveries, :status
  end
end
