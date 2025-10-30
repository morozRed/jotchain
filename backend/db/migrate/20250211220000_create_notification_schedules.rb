# frozen_string_literal: true

class CreateNotificationSchedules < ActiveRecord::Migration[8.0]
  def change
    create_table :notification_schedules, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :channel, null: false, default: "email"
      t.boolean :enabled, null: false, default: true
      t.time :time_of_day, null: false
      t.string :timezone, null: false, default: "UTC"
      t.string :recurrence, null: false, default: "weekly"
      t.integer :weekly_day
      t.integer :day_of_month
      t.integer :custom_interval_value
      t.string :custom_interval_unit
      t.string :lookback_type, null: false, default: "week"
      t.integer :lookback_days
      t.integer :lead_time_minutes, null: false, default: 30

      t.timestamps
    end

    add_index :notification_schedules, [:user_id, :created_at]
  end
end
