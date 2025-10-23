# frozen_string_literal: true

class MeetingSchedulesController < InertiaController
  before_action :set_schedule

  def update
    if @schedule.update(schedule_params)
      redirect_to dashboard_path, notice: "Schedule updated"
    else
      redirect_to dashboard_path, inertia: inertia_errors(@schedule)
    end
  end

  private

  def set_schedule
    @schedule = Current.user.meeting_schedules.find(params[:id])
  end

  def schedule_params
    params.require(:meeting_schedule).permit(:enabled, :time_of_day, :timezone, :weekly_day, :monthly_week, :lead_time_minutes)
  end
end
