class EntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_entry, only: [:show, :edit, :update, :destroy, :toggle_win]

  def index
    @entries = current_user.entries.recent.page(params[:page]).per(20)
  end

  def show
  end

  def new
    @entry = current_user.entries.build(entry_date: params[:date] || Date.current)
  end

  def create
    @entry = current_user.entries.build(entry_params)
    # Auto-mark as win if win_description is present
    @entry.is_win = true if @entry.win_description.present?

    if @entry.save
      respond_to do |format|
        format.html { redirect_to dashboard_path, notice: 'Entry was successfully created.' }
        format.turbo_stream
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    # Auto-mark as win if win_description is present
    params[:entry][:is_win] = true if params[:entry][:win_description].present?

    if @entry.update(entry_params)
      respond_to do |format|
        format.html { redirect_to dashboard_path, notice: 'Entry was successfully updated.' }
        format.turbo_stream
      end
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @entry.destroy
    respond_to do |format|
      format.html { redirect_to dashboard_path, notice: 'Entry was successfully deleted.' }
      format.turbo_stream
    end
  end

  def toggle_win
    @entry.update(is_win: !@entry.is_win)
    respond_to do |format|
      format.html { redirect_back(fallback_location: dashboard_path) }
      format.turbo_stream
    end
  end

  private

  def set_entry
    @entry = current_user.entries.find(params[:id])
  end

  def entry_params
    params.require(:entry).permit(:content, :next_actions, :entry_date, :is_win, :win_level, :win_description)
  end
end