# frozen_string_literal: true

class AddCancelAtPeriodEndToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :cancel_at_period_end, :boolean, default: false, null: false
  end
end
