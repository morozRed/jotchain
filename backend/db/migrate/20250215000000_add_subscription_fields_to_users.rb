class AddSubscriptionFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :stripe_customer_id, :string
    add_column :users, :stripe_subscription_id, :string
    add_column :users, :subscription_status, :string, default: "trialing", null: false
    add_column :users, :plan_type, :string
    add_column :users, :trial_ends_at, :datetime
    add_column :users, :current_period_end, :datetime

    add_index :users, :stripe_customer_id
    add_index :users, :stripe_subscription_id
  end
end
