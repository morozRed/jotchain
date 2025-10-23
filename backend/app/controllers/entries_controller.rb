# frozen_string_literal: true

class EntriesController < InertiaController
  before_action :set_entry, only: %i[update destroy]

  def create
    entry = Current.user.entries.new(entry_params)
    entry.logged_at ||= Time.current

    if entry.save
      redirect_to dashboard_path, notice: "Entry logged for #{entry.logged_at.to_date.to_fs(:long)}"
    else
      redirect_to dashboard_path, inertia: inertia_errors(entry)
    end
  end

  def update
    if @entry.update(entry_params)
      redirect_to dashboard_path, notice: "Entry updated"
    else
      redirect_to dashboard_path, inertia: inertia_errors(@entry)
    end
  end

  def destroy
    @entry.destroy!
    redirect_to dashboard_path, notice: "Entry deleted"
  end

  private

  def set_entry
    @entry = Current.user.entries.find(params[:id])
  end

  def entry_params
    params.require(:entry).permit(:body, :tag, :logged_at)
  end
end
