puts "Seeding JotChain starter data..."

return unless Space.none?

product_space = Space.create_with(
  description: "Capture wins, 1-1 notes, and launch recaps for the product org.",
  color: "#6366F1"
).find_or_create_by!(name: "Product Leadership")

growth_space = Space.create_with(
  description: "Track signals across pipeline reviews, customer feedback, and revenue plays.",
  color: "#22D3EE"
).find_or_create_by!(name: "Revenue & Growth")

weekly_wins = product_space.chains.create_with(
  description: "A running stream of accomplishments and unblockers for weekly exec syncs.",
  purpose: "Prep highlights for Monday leadership sync.",
  status: :active
).find_or_create_by!(name: "Weekly Wins")

one_on_one = product_space.chains.create_with(
  description: "Document every 1-1 with Andrew to capture coaching moments and commitments.",
  purpose: "Keep a clean log of feedback loops for promo packets.",
  status: :active
).find_or_create_by!(name: "1-1 with Andrew")

pipeline = growth_space.chains.create_with(
  description: "Notes from weekly pipeline reviews and customer signals.",
  purpose: "Spot repeat blockers and revenue risks early.",
  status: :active
).find_or_create_by!(name: "Pipeline Pulse")

def create_link(chain, title:, body:, category:, tags:, mentions:, recorded_on:, linked_chain_ids: [])
  chain.links.create_with(
    title: title,
    body: body,
    category: category,
    recorded_on: recorded_on,
    tags: tags,
    mentions: mentions,
    linked_chain_ids: linked_chain_ids,
    summary: nil,
    sentiment: :positive
  ).find_or_create_by!(title: title, recorded_on: recorded_on)
end

create_link(
  weekly_wins,
  title: "Closed loop on beta experiment",
  body: "We shipped the new onboarding wizard variant and saw a 16% lift in weekly active teams. Rolled findings into GTM deck.",
  category: :accomplishment,
  tags: %w[Launch Experimentation Growth],
  mentions: ["Maya", "Design Squad"],
  recorded_on: 1.day.ago.to_date
)

create_link(
  weekly_wins,
  title: "Executive alignment",
  body: "Prepped execs for Q2 OKR review using JotChain summary draft. Highlighted revenue expansion and tech debt paydown plan.",
  category: :update,
  tags: %w[Leadership Strategy],
  mentions: ["Exec Staff"],
  recorded_on: 3.days.ago.to_date,
  linked_chain_ids: [pipeline.id]
)

create_link(
  one_on_one,
  title: "Growth roadmap feedback",
  body: "Andrew pushed for clearer owner on onboarding revamp. Agreed to pair Maya with Jordan to land by end of month.",
  category: :feedback,
  tags: ["Coaching", "Focus"],
  mentions: ["Andrew"],
  recorded_on: 2.days.ago.to_date
)

create_link(
  pipeline,
  title: "Renewal risk mitigated",
  body: "Flagged Acme Corp churn risk due to missing analytics. Paired CS with PM to ship dashboard before QBR.",
  category: :risk,
  tags: %w[Revenue NRR Customer],
  mentions: ["Acme Corp", "CS Team"],
  recorded_on: Date.today,
  linked_chain_ids: [weekly_wins.id]
)

puts "Seed complete."
