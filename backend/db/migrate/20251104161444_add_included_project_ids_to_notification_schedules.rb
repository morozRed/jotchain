# frozen_string_literal: true

class AddIncludedProjectIdsToNotificationSchedules < ActiveRecord::Migration[8.0]
  def change
    add_column :notification_schedules, :included_project_ids, :jsonb, default: nil
    # nil means "all projects", empty array [] means "no projects", or specific project IDs
  end
end
