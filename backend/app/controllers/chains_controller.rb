require "ostruct"

class ChainsController < ApplicationController
  before_action :set_space
  before_action :set_chain, only: %i[show edit update destroy]

  def new
    @chain = @space.chains.build
  end

  def create
    # If space_id is passed directly (from modal), use that
    if params[:chain][:space_id].present?
      @space = Space.find(params[:chain][:space_id])
    end

    @chain = @space.chains.build(chain_params.except(:space_id))

    if @chain.save
      flash.now[:notice] = "Chain created."
      flash[:notice] = "Chain created."
      @new_chain = @space.chains.build
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to @chain, notice: "Chain created." }
      end
    else
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "chain_form",
            partial: "chains/form",
            locals: { chain: @chain, space: @space }
          )
        end
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  def show
    @link = @chain.links.build(recorded_on: Date.current)
    @filters = OpenStruct.new(
      category: params[:category],
      tag: params[:tag],
      mention: params[:mention]
    )

    @links = @chain.links.recent
    @links = @links.with_category(@filters.category)
    @links = @links.tagged_with(@filters.tag)
    @links = @links.mentioning(@filters.mention)
  end

  def edit; end

  def update
    if @chain.update(chain_params)
      redirect_to @chain, notice: "Chain updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @chain.destroy
    redirect_to space_path(@space), notice: "Chain archived."
  end

  private

  def set_space
    @space = if params[:space_id].present?
               Space.find(params[:space_id])
             elsif params[:id].present?
               Chain.find(params[:id]).space
             end
  end

  def set_chain
    @chain = params[:id] ? Chain.find(params[:id]) : @space.chains.find(params[:chain_id])
  end

  def chain_params
    params.require(:chain).permit(:name, :description, :purpose, :status, :color, :space_id)
  end
end
