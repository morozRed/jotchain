class EntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_entry, only: [:show, :edit, :update, :destroy]
  before_action :check_entry_access, only: [:show, :edit, :update, :destroy]
  before_action :check_export_access, only: [:export]

  def index
    @entries = current_user.accessible_entries.recent
    @show_upgrade_banner = !current_user.has_active_subscription? || current_user.subscription&.free?

    # Apply filters
    case params[:filter]
    when 'wins'
      @entries = @entries.wins
    when 'week'
      @entries = @entries.where(entry_date: 1.week.ago.to_date..Date.current)
    when 'month'
      @entries = @entries.where(entry_date: 1.month.ago.to_date..Date.current)
    end

    @entries = @entries.page(params[:page]).per(20)
  end

  def export
    @entries = current_user.accessible_entries.recent

    # Apply same filters as index
    case params[:filter]
    when 'wins'
      @entries = @entries.wins
    when 'week'
      @entries = @entries.where(entry_date: 1.week.ago.to_date..Date.current)
    when 'month'
      @entries = @entries.where(entry_date: 1.month.ago.to_date..Date.current)
    end

    respond_to do |format|
      format.md { send_data generate_markdown_export(@entries), filename: "journal_entries.md", type: 'text/markdown' }
      format.txt { send_data generate_text_export(@entries), filename: "journal_entries.txt", type: 'text/plain' }
      format.csv { send_data generate_csv_export(@entries), filename: "journal_entries.csv", type: 'text/csv' }
    end
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


  private

  def set_entry
    @entry = current_user.entries.find(params[:id])
  end

  def check_entry_access
    unless current_user.can_access_entries_before?(@entry.entry_date)
      flash[:alert] = "This entry is older than 3 days. Upgrade to Pro for unlimited history access."
      redirect_to billing_path
    end
  end

  def check_export_access
    unless current_user.can_export?
      flash[:alert] = "Export functionality is only available for Pro users."
      redirect_to billing_path
    end
  end

  def entry_params
    params.require(:entry).permit(:content, :next_actions, :entry_date, :is_win, :win_level, :win_description)
  end

  def generate_markdown_export(entries)
    output = "# Journal Entries\n"
    output << "*Exported from JotChain on #{Date.current.strftime('%B %d, %Y')}*\n\n"

    entries.each do |entry|
      output << "## #{entry.entry_date.strftime('%B %d, %Y')}\n\n"

      if entry.content.present?
        output << "### What I did\n"
        output << "#{entry.content}\n\n"
      end

      if entry.next_actions.present?
        output << "### What next\n"
        output << "#{entry.next_actions}\n\n"
      end

      if entry.is_win? && entry.win_description.present?
        output << "### Win (#{entry.win_level&.humanize&.titleize})\n"
        output << "#{entry.win_description}\n\n"
      end

      output << "---\n\n"
    end

    output
  end

  def generate_text_export(entries)
    output = "JOURNAL ENTRIES\n"
    output << "Exported from JotChain on #{Date.current.strftime('%B %d, %Y')}\n"
    output << "=" * 50 + "\n\n"

    entries.each do |entry|
      output << "Date: #{entry.entry_date.strftime('%B %d, %Y')}\n"
      output << "-" * 30 + "\n\n"

      if entry.content.present?
        output << "WHAT I DID:\n"
        output << "#{entry.content}\n\n"
      end

      if entry.next_actions.present?
        output << "WHAT NEXT:\n"
        output << "#{entry.next_actions}\n\n"
      end

      if entry.is_win?
        output << "WIN: #{entry.win_level&.upcase&.gsub('_', ' ')}\n"
        output << "#{entry.win_description}\n\n" if entry.win_description.present?
      end

      output << "\n"
    end

    output
  end

  def generate_csv_export(entries)
    require 'csv'

    CSV.generate do |csv|
      csv << ['Date', 'Day', 'Content', 'Next Actions', 'Is Win', 'Win Level', 'Win Description']

      entries.each do |entry|
        csv << [
          entry.entry_date.strftime('%Y-%m-%d'),
          entry.entry_date.strftime('%A'),
          entry.content,
          entry.next_actions,
          entry.is_win? ? 'Yes' : 'No',
          entry.win_level&.humanize,
          entry.win_description
        ]
      end
    end
  end
end
