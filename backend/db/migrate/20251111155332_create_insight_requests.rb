# frozen_string_literal: true

class CreateInsightRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :insight_requests, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :name, null: false
      t.string :query_type, null: false
      t.text :custom_query

      t.datetime :date_range_start, null: false
      t.datetime :date_range_end, null: false

      t.jsonb :project_ids, default: []
      t.jsonb :person_ids, default: []

      t.string :status, default: "pending", null: false
      t.jsonb :result_payload
      t.text :content
      t.string :result_model
      t.integer :prompt_tokens
      t.integer :completion_tokens
      t.text :error_message

      t.datetime :completed_at
      t.timestamps

      t.index [:user_id, :created_at]
      t.index [:user_id, :status]
    end

    add_foreign_key :insight_requests, :users
  end
end
