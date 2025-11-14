class AddDeletedAtToInsightRequests < ActiveRecord::Migration[8.0]
  def change
    add_column :insight_requests, :deleted_at, :datetime
    add_index :insight_requests, :deleted_at
  end
end
