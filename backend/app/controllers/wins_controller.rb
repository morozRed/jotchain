class WinsController < ApplicationController
  before_action :authenticate_user!

  def index
    @wins = current_user.entries.wins.recent

    if params[:level].present?
      @wins = @wins.where(win_level: params[:level])
    end

    @wins = @wins.page(params[:page]).per(20)

    @wins_by_level = current_user.wins_by_level
    @total_wins = current_user.total_wins
  end

  def export
    @wins = current_user.entries.wins.recent

    if params[:level].present?
      @wins = @wins.where(win_level: params[:level])
    end

    if params[:format] == 'markdown'
      render plain: generate_markdown_export(@wins), content_type: 'text/markdown'
    else
      render plain: generate_text_export(@wins), content_type: 'text/plain'
    end
  end

  private

  def generate_markdown_export(wins)
    output = "# Professional Wins Portfolio\n"
    output << "*Generated from JotChain on #{Date.current.strftime('%B %d, %Y')}*\n\n"

    wins.group_by(&:win_level).each do |level, level_wins|
      output << "## #{level.humanize.titleize} Wins\n\n"
      level_wins.each do |win|
        output << "### #{win.entry_date.strftime('%B %Y')}\n"
        output << "#{win.content}\n\n"
      end
    end

    output
  end

  def generate_text_export(wins)
    output = "PROFESSIONAL WINS PORTFOLIO\n"
    output << "Generated from JotChain on #{Date.current.strftime('%B %d, %Y')}\n"
    output << "=" * 50 + "\n\n"

    wins.group_by(&:win_level).each do |level, level_wins|
      output << "#{level.upcase.gsub('_', ' ')} WINS\n"
      output << "-" * 30 + "\n\n"
      level_wins.each do |win|
        output << "Date: #{win.entry_date.strftime('%B %d, %Y')}\n"
        output << "#{win.content}\n"
        output << "\n"
      end
    end

    output
  end
end