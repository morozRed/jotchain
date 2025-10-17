module ApplicationHelper
  def modal_context_space_id
    value =
      if defined?(@space) && @space.respond_to?(:id) && @space&.persisted?
        @space.id
      elsif defined?(@chain) && @chain.respond_to?(:space_id) && @chain&.space_id.present?
        @chain.space_id
      elsif defined?(@link)
        if @link.respond_to?(:space_id) && @link.space_id.present?
          @link.space_id
        elsif @link.respond_to?(:chain) && (linked_chain = @link.chain)
          linked_chain.space_id if linked_chain.respond_to?(:space_id)
        end
      elsif params[:space_id].present?
        params[:space_id]
      end

    value.presence && value.to_i
  end

  def modal_context_chain_id
    value =
      if defined?(@chain) && @chain.respond_to?(:id) && @chain&.persisted?
        @chain.id
      elsif defined?(@link)
        if @link.respond_to?(:chain_id) && @link.chain_id.present?
          @link.chain_id
        elsif @link.respond_to?(:chain) && (linked_chain = @link.chain)
          linked_chain.id if linked_chain.respond_to?(:id)
        end
      elsif params[:chain_id].present?
        params[:chain_id]
      end

    value.presence && value.to_i
  end
end
