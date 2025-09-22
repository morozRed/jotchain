class EntriesController < ApplicationController
  before_action :set_entry, only: %i[ show edit update destroy ]

  def index
    @entries = Current.user.entries.order(entry_date: :desc).limit(params.fetch(:limit, 6))
  end

  def show; end

  def new
    @entry = Current.user.entries.build(entry_date: Date.current)
  end

  def edit; end

  def create
    @entry = Current.user.entries.build(entry_params)
    if @entry.save
      respond_to do |format|
        format.html { redirect_to @entry, notice: "Entry created" }
        format.turbo_stream
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @entry.update(entry_params)
      respond_to do |format|
        format.html { redirect_to @entry, notice: "Entry updated" }
        format.turbo_stream
      end
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @entry.destroy
    respond_to do |format|
      format.html { redirect_to entries_url, notice: "Entry deleted" }
      format.turbo_stream
    end
  end

  # Context recall: return the most recent entry as JSON for prefill/show
  def previous
    entry = Current.user.entries.order(entry_date: :desc, created_at: :desc).first
    if entry
      render json: { id: entry.id, entry_date: entry.entry_date,
                     day_log: entry.day_log, next_actions: entry.next_actions, win: entry.win }
    else
      render json: { }, status: :no_content
    end
  end

  private
    def set_entry
      @entry = Current.user.entries.find(params[:id])
    end

    def entry_params
      params.require(:entry).permit(:entry_date, :category_id, :day_log, :next_actions, :win)
    end
end

