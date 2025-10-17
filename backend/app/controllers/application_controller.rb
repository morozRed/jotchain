class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :load_sidebar_spaces

  private

  def load_sidebar_spaces
    @sidebar_spaces = Space.order(:name)
  end
end
