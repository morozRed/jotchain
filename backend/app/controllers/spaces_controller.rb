require "ostruct"

class SpacesController < ApplicationController
  before_action :set_space, only: %i[show edit update destroy]

  def index
    @spaces = Space.includes(chains: :links).order(:name)
    @space = Space.new
  end

  def new
    @space = Space.new
  end

  def show
    @chains = @space.chains.includes(:links)

    # Apply chain filters
    if params[:search].present?
      @chains = @chains.where("name ILIKE ?", "%#{params[:search]}%")
    end

    if params[:status].present?
      @chains = @chains.where(status: params[:status])
    end

    # Recent links (unfiltered)
    @recent_links = @space.links.recent.limit(12)
    @chain = @space.chains.build
  end

  def create
    @space = Space.new(space_params)

    respond_to do |format|
      if @space.save
        flash.now[:notice] = "Space created."
        @new_space = Space.new

        format.turbo_stream
        format.html { redirect_to @space, notice: "Space created." }
      else
        format.turbo_stream do
          render turbo_stream: turbo_stream.update(
            "new_space",
            partial: "spaces/form",
            locals: { space: @space }
          ), status: :unprocessable_entity
        end

        format.html do
          @spaces = Space.includes(chains: :links).order(:name)
          render :index, status: :unprocessable_entity
        end
      end
    end
  end

  def edit
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def update
    respond_to do |format|
      if @space.update(space_params)
        flash.now[:notice] = "Space updated."
        flash[:notice] = "Space updated."

        format.turbo_stream
        format.html { redirect_to @space, notice: "Space updated." }
      else
        format.turbo_stream do
          render turbo_stream: turbo_stream.update(
            "space_edit_modal",
            partial: "spaces/edit_modal"
          ), status: :unprocessable_entity
        end
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @space.destroy
    redirect_to spaces_path, notice: "Space removed."
  end

  private

  def set_space
    @space = Space.find(params[:id])
  end

  def space_params
    params.require(:space).permit(:name, :description)
  end
end
