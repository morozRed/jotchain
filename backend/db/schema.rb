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

ActiveRecord::Schema[8.0].define(version: 2025_11_04_161444) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.text "body", null: false
    t.string "tag"
    t.datetime "logged_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "body_format", default: "tiptap", null: false
    t.index ["user_id", "logged_at"], name: "index_entries_on_user_id_and_logged_at"
    t.index ["user_id", "tag"], name: "index_entries_on_user_id_and_tag"
    t.index ["user_id"], name: "index_entries_on_user_id"
  end

  create_table "entry_mentions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "entry_id", null: false
    t.string "mentionable_type", null: false
    t.uuid "mentionable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["entry_id", "mentionable_type", "mentionable_id"], name: "index_entry_mentions_uniqueness", unique: true
    t.index ["entry_id"], name: "index_entry_mentions_on_entry_id"
    t.index ["mentionable_type", "mentionable_id"], name: "index_entry_mentions_on_mentionable"
  end

  create_table "notification_deliveries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "notification_schedule_id", null: false
    t.uuid "user_id", null: false
    t.datetime "occurrence_at", null: false
    t.datetime "trigger_at", null: false
    t.datetime "window_start", null: false
    t.datetime "window_end", null: false
    t.string "status", default: "pending", null: false
    t.jsonb "summary_payload"
    t.string "summary_model"
    t.integer "prompt_tokens"
    t.integer "completion_tokens"
    t.text "error_message"
    t.datetime "delivered_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["notification_schedule_id", "occurrence_at"], name: "index_notification_deliveries_on_schedule_and_occurrence", unique: true
    t.index ["status"], name: "index_notification_deliveries_on_status"
    t.index ["trigger_at"], name: "index_notification_deliveries_on_trigger_at"
  end

  create_table "notification_schedules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.string "channel", default: "email", null: false
    t.boolean "enabled", default: true, null: false
    t.time "time_of_day", null: false
    t.string "timezone", default: "UTC", null: false
    t.string "recurrence", default: "weekly", null: false
    t.integer "weekly_day"
    t.integer "day_of_month"
    t.integer "custom_interval_value"
    t.string "custom_interval_unit"
    t.string "lookback_type", default: "week", null: false
    t.integer "lookback_days"
    t.integer "lead_time_minutes", default: 30, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "included_project_ids"
    t.index ["user_id", "created_at"], name: "index_notification_schedules_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_notification_schedules_on_user_id"
  end

  create_table "persons", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_persons_on_user_id_and_name"
    t.index ["user_id"], name: "index_persons_on_user_id"
  end

  create_table "project_persons", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id", null: false
    t.uuid "person_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_project_persons_on_person_id"
    t.index ["project_id", "person_id"], name: "index_project_persons_on_project_id_and_person_id", unique: true
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_projects_on_user_id_and_name"
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "user_agent"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest"
    t.boolean "verified", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "stripe_customer_id"
    t.string "stripe_subscription_id"
    t.string "subscription_status", default: "trialing", null: false
    t.string "plan_type"
    t.datetime "trial_ends_at"
    t.datetime "current_period_end"
    t.boolean "cancel_at_period_end", default: false, null: false
    t.string "provider"
    t.string "uid"
    t.string "avatar_url"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["stripe_customer_id"], name: "index_users_on_stripe_customer_id"
    t.index ["stripe_subscription_id"], name: "index_users_on_stripe_subscription_id"
  end

  add_foreign_key "entries", "users"
  add_foreign_key "entry_mentions", "entries"
  add_foreign_key "notification_deliveries", "notification_schedules"
  add_foreign_key "notification_deliveries", "users"
  add_foreign_key "notification_schedules", "users"
  add_foreign_key "persons", "users"
  add_foreign_key "project_persons", "persons"
  add_foreign_key "project_persons", "projects"
  add_foreign_key "projects", "users"
  add_foreign_key "sessions", "users"
end
