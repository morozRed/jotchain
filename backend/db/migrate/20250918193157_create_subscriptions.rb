class CreateSubscriptions < ActiveRecord::Migration[8.0]
  def change
    create_table :subscriptions, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :stripe_subscription_id
      t.string :stripe_customer_id
      t.string :stripe_price_id
      t.string :status, null: false, default: 'inactive'
      t.string :plan_name, null: false, default: 'free'
      t.datetime :current_period_start
      t.datetime :current_period_end
      t.datetime :canceled_at
      t.boolean :cancel_at_period_end, default: false

      t.timestamps
    end

    add_index :subscriptions, :stripe_subscription_id, unique: true
    add_index :subscriptions, :stripe_customer_id
    add_index :subscriptions, :status
  end
end
