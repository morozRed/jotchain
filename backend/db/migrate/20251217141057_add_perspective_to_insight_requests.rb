class AddPerspectiveToInsightRequests < ActiveRecord::Migration[8.0]
  def change
    add_column :insight_requests, :perspective, :string
  end
end
