# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_22_162452) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "ai_usage_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "generation_type", null: false
    t.string "timeframe"
    t.integer "entry_count"
    t.text "prompt"
    t.text "response"
    t.decimal "cost", precision: 10, scale: 4
    t.integer "response_time_ms"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["generation_type"], name: "index_ai_usage_logs_on_generation_type"
    t.index ["user_id", "created_at"], name: "index_ai_usage_logs_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_ai_usage_logs_on_user_id"
  end

  create_table "categories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name_ciphertext", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "position"], name: "index_categories_on_user_id_and_position"
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "chains", force: :cascade do |t|
    t.bigint "space_id", null: false
    t.string "name", null: false
    t.text "description"
    t.string "purpose"
    t.string "status", default: "active", null: false
    t.string "color"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["space_id", "position"], name: "index_chains_on_space_id_and_position"
    t.index ["space_id"], name: "index_chains_on_space_id"
  end

  create_table "entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "category_id", null: false
    t.text "day_log_ciphertext"
    t.text "next_actions_ciphertext"
    t.text "win_ciphertext"
    t.date "entry_date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_entries_on_category_id"
    t.index ["entry_date"], name: "index_entries_on_entry_date"
    t.index ["user_id", "entry_date", "category_id"], name: "index_entries_on_user_id_and_entry_date_and_category_id", unique: true
    t.index ["user_id", "entry_date"], name: "index_entries_on_user_id_and_entry_date"
    t.index ["user_id"], name: "index_entries_on_user_id"
  end

  create_table "links", force: :cascade do |t|
    t.bigint "chain_id", null: false
    t.string "title"
    t.text "body", null: false
    t.string "category", default: "note", null: false
    t.date "recorded_on", null: false
    t.integer "sentiment", default: 0, null: false
    t.text "summary"
    t.string "tags", default: [], null: false, array: true
    t.string "mentions", default: [], null: false, array: true
    t.integer "linked_chain_ids", default: [], null: false, array: true
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_links_on_category"
    t.index ["chain_id"], name: "index_links_on_chain_id"
    t.index ["linked_chain_ids"], name: "index_links_on_linked_chain_ids", using: :gin
    t.index ["mentions"], name: "index_links_on_mentions", using: :gin
    t.index ["recorded_on"], name: "index_links_on_recorded_on"
    t.index ["tags"], name: "index_links_on_tags", using: :gin
  end

  create_table "sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "last_active_at"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_sessions_on_expires_at"
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "spaces", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug"
    t.string "color"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_spaces_on_slug", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.string "name"
    t.string "provider"
    t.string "uid"
    t.string "recovery_phrase_ciphertext"
    t.string "stripe_customer_id"
    t.string "subscription_status", default: "free"
    t.datetime "subscription_expires_at"
    t.boolean "ai_consent", default: false
    t.datetime "last_active_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["stripe_customer_id"], name: "index_users_on_stripe_customer_id"
  end

  add_foreign_key "ai_usage_logs", "users"
  add_foreign_key "categories", "users"
  add_foreign_key "chains", "spaces"
  add_foreign_key "entries", "categories"
  add_foreign_key "entries", "users"
  add_foreign_key "links", "chains"
  add_foreign_key "sessions", "users"
end
