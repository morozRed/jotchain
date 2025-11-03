# frozen_string_literal: true

class AddOauthToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :provider, :string
    add_column :users, :uid, :string
    add_column :users, :avatar_url, :string

    # Add index for efficient OAuth lookups
    add_index :users, [ :provider, :uid ], unique: true

    # Allow password_digest to be null for OAuth-only users
    change_column_null :users, :password_digest, true
  end
end
