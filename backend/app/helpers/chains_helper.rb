module ChainsHelper
  def chain_filter_params(overrides = {})
    filtered = request.query_parameters.deep_dup

    overrides.each do |key, value|
      key = key.to_s
      if value.blank?
        filtered.delete(key)
      else
        filtered[key] = value
      end
    end

    filtered
  end

  def chain_heatmap_cell_classes(count, max, active: false)
    base_classes = [
      "group relative block h-3 w-3 rounded-sm transition-all duration-150"
    ]

    if max.to_i <= 0 || count.to_i <= 0
      base_classes << "border border-white/10 bg-slate-900/40 group-hover:border-indigo-400/50 group-hover:bg-slate-800/60"
    else
      levels = [
        "bg-indigo-950/70 group-hover:bg-indigo-900/70",
        "bg-indigo-800/80 group-hover:bg-indigo-700/80",
        "bg-indigo-600/80 group-hover:bg-indigo-500/80",
        "bg-indigo-400/90 group-hover:bg-indigo-300/90"
      ]
      index = ((count.to_f / max.to_f) * (levels.length - 1)).round
      level = levels[[index, levels.length - 1].min]
      base_classes << "border border-indigo-400/40 #{level}"
    end

    if active
      base_classes << "ring-2 ring-offset-2 ring-offset-slate-950 ring-indigo-300"
    else
      base_classes << "group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-offset-slate-950 group-hover:ring-indigo-200/60"
    end

    base_classes.join(" ")
  end

  def chain_heatmap_cell_title(date, count)
    formatted_date = date.strftime("%b %-d, %Y")
    entries_text = count == 1 ? "1 note" : "#{count} notes"
    "#{formatted_date} · #{entries_text}"
  end
end
