# frozen_string_literal: true

class DropMeetingSchedules < ActiveRecord::Migration[8.0]
  def change
    drop_table :meeting_schedules do |t|
      t.uuid :user_id, null: false
      t.string :meeting_type, null: false
      t.boolean :enabled, null: false, default: true
      t.time :time_of_day, null: false
      t.string :timezone, null: false, default: "UTC"
      t.integer :weekly_day
      t.integer :monthly_week
      t.integer :lead_time_minutes, null: false, default: 30
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false

      t.index [:user_id, :meeting_type], unique: true
      t.index :user_id
    end
  end
end
