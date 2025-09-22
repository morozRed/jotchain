class DashboardController < ApplicationController
  def index
    @todays_entry = Current.user.entries.for_date(Date.current).first
    @recent_entries = Current.user.entries.recent.limit(6)
    @categories = Current.user.categories.order(:name)

    # For new entry form
    @entry = @todays_entry || Current.user.entries.build(entry_date: Date.current)
  end
end