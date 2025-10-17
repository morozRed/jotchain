require "ostruct"

class LinksController < ApplicationController
  include ActionView::RecordIdentifier

  before_action :set_chain
  before_action :set_link, only: %i[edit update destroy]

  def new
    if @chain
      @link = @chain.links.build(recorded_on: Date.current)
    else
      @link = Link.new(recorded_on: Date.current)
    end
  end

  def create
    # If chain_id is passed directly (from modal), use that
    if params[:link][:chain_id].present?
      @chain = Chain.find(params[:link][:chain_id])
    end

    @link = @chain.links.build(link_params.except(:chain_id, :space_id))

    if @link.save
      message = "Note captured in #{@chain.name}."
      flash.now[:notice] = message
      flash[:notice] = message
      @new_link = @chain.links.build(recorded_on: Date.current)
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to @chain, notice: "Link captured." }
      end
    else
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            dom_id(@link, :form),
            partial: "links/form",
            locals: { chain: @chain, link: @link }
          )
        end
        format.html do
          prepare_collection
          render "chains/show", status: :unprocessable_entity
        end
      end
    end
  end

  def edit; end

  def update
    if @link.update(link_params)
      flash.now[:notice] = "Note updated."
      flash[:notice] = "Note updated."
      @link.reload
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to @chain, notice: "Link updated." }
      end
    else
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            dom_id(@link, :form),
            partial: "links/form",
            locals: { chain: @chain, link: @link }
          )
        end
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @link.destroy
    flash.now[:notice] = "Note removed."
    flash[:notice] = "Note removed."

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to @chain, notice: "Link removed." }
    end
  end

  private

  def set_chain
    @chain = if params[:chain_id]
               Chain.find(params[:chain_id])
             elsif params[:id]
               Link.find(params[:id]).chain
             end
  end

  def set_link
    @link = @chain.links.find(params[:id])
  end

  def link_params
    params.require(:link).permit(
      :title,
      :body,
      :category,
      :recorded_on,
      :sentiment,
      :summary,
      :tag_list,
      :mention_list,
      :chain_id,
      :space_id,
      linked_chain_ids: []
    )
  end

  def prepare_collection
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
end
