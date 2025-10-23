# frozen_string_literal: true

class CreateMeetingSchedules < ActiveRecord::Migration[8.0]
  def change
    create_table :meeting_schedules do |t|
      t.references :user, null: false, foreign_key: true
      t.string :meeting_type, null: false
      t.boolean :enabled, null: false, default: true
      t.time :time_of_day, null: false
      t.string :timezone, null: false, default: "UTC"
      t.integer :weekly_day
      t.integer :monthly_week
      t.integer :lead_time_minutes, null: false, default: 30

      t.timestamps
    end

    add_index :meeting_schedules, [:user_id, :meeting_type], unique: true
  end
end
