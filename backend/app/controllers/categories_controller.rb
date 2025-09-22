class CategoriesController < ApplicationController
  before_action :set_category, only: %i[ show edit update destroy ]

  def index
    @categories = Current.user.categories.order(created_at: :desc)
  end

  def show; end

  def new
    @category = Current.user.categories.build
  end

  def edit; end

  def create
    @category = Current.user.categories.build(category_params)
    if @category.save
      respond_to do |format|
        format.html { redirect_to @category, notice: "Category created" }
        format.turbo_stream
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      respond_to do |format|
        format.html { redirect_to @category, notice: "Category updated" }
        format.turbo_stream
      end
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @category.destroy
    respond_to do |format|
      format.html { redirect_to categories_url, notice: "Category deleted" }
      format.turbo_stream
    end
  end

  private
    def set_category
      @category = Current.user.categories.find(params[:id])
    end

    def category_params
      params.require(:category).permit(:name)
    end
end

