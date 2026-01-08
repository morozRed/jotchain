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

ActiveRecord::Schema[8.0].define(version: 2026_01_08_145053) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "contributor_person_links", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "github_contributor_id", null: false
    t.uuid "person_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["github_contributor_id"], name: "index_contributor_person_links_on_github_contributor_id"
    t.index ["person_id"], name: "index_contributor_person_links_on_person_id"
    t.index ["user_id", "github_contributor_id"], name: "idx_contributor_person_links_user_contributor", unique: true
    t.index ["user_id"], name: "index_contributor_person_links_on_user_id"
  end

  create_table "entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.text "body", null: false
    t.string "tag"
    t.datetime "logged_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "body_format", default: "tiptap", null: false
    t.index ["user_id", "logged_at"], name: "index_entries_on_user_and_logged_at"
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
    t.index ["entry_id", "mentionable_type", "mentionable_id"], name: "index_entry_mentions_composite"
    t.index ["entry_id", "mentionable_type", "mentionable_id"], name: "index_entry_mentions_uniqueness", unique: true
    t.index ["entry_id"], name: "index_entry_mentions_on_entry_id"
    t.index ["mentionable_type", "mentionable_id"], name: "index_entry_mentions_on_mentionable"
  end

  create_table "github_commits", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "github_repository_id", null: false
    t.uuid "author_id"
    t.string "sha", null: false
    t.text "message"
    t.datetime "committed_at", null: false
    t.integer "additions", default: 0
    t.integer "deletions", default: 0
    t.integer "files_changed", default: 0
    t.string "author_email"
    t.string "author_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_github_commits_on_author_id"
    t.index ["committed_at"], name: "index_github_commits_on_committed_at"
    t.index ["github_repository_id", "committed_at"], name: "index_github_commits_on_github_repository_id_and_committed_at"
    t.index ["github_repository_id", "sha"], name: "index_github_commits_on_github_repository_id_and_sha", unique: true
    t.index ["sha"], name: "index_github_commits_on_sha"
  end

  create_table "github_contributors", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.bigint "github_id", null: false
    t.string "login", null: false
    t.string "name"
    t.string "avatar_url"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["github_id"], name: "index_github_contributors_on_github_id"
    t.index ["workspace_id", "github_id"], name: "index_github_contributors_on_workspace_id_and_github_id", unique: true
    t.index ["workspace_id", "login"], name: "index_github_contributors_on_workspace_id_and_login"
  end

  create_table "github_installations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.bigint "installation_id", null: false
    t.string "account_login", null: false
    t.string "account_type", null: false
    t.bigint "account_id", null: false
    t.string "target_type"
    t.jsonb "permissions", default: {}
    t.jsonb "events", default: []
    t.string "repository_selection"
    t.datetime "suspended_at"
    t.string "access_token"
    t.datetime "access_token_expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["installation_id"], name: "index_github_installations_on_installation_id", unique: true
    t.index ["workspace_id", "account_login"], name: "index_github_installations_on_workspace_id_and_account_login"
    t.index ["workspace_id"], name: "index_github_installations_on_workspace_id"
  end

  create_table "github_issues", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "github_repository_id", null: false
    t.uuid "author_id"
    t.bigint "github_id", null: false
    t.integer "number", null: false
    t.string "title", null: false
    t.text "body"
    t.string "state", null: false
    t.string "state_reason"
    t.datetime "opened_at", null: false
    t.datetime "closed_at"
    t.jsonb "labels", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_github_issues_on_author_id"
    t.index ["github_repository_id", "github_id"], name: "index_github_issues_on_github_repository_id_and_github_id", unique: true
    t.index ["github_repository_id", "number"], name: "index_github_issues_on_github_repository_id_and_number", unique: true
    t.index ["github_repository_id", "state"], name: "index_github_issues_on_github_repository_id_and_state"
    t.index ["opened_at"], name: "index_github_issues_on_opened_at"
    t.index ["state"], name: "index_github_issues_on_state"
  end

  create_table "github_metric_snapshots", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "github_contributor_id"
    t.uuid "github_repository_id"
    t.string "period_type", null: false
    t.date "period_start", null: false
    t.date "period_end", null: false
    t.jsonb "metrics", default: {}, null: false
    t.datetime "computed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["computed_at"], name: "index_github_metric_snapshots_on_computed_at"
    t.index ["github_contributor_id", "period_type"], name: "idx_on_github_contributor_id_period_type_00a69b7439"
    t.index ["github_repository_id", "period_type"], name: "idx_on_github_repository_id_period_type_4cad76a975"
    t.index ["workspace_id", "github_contributor_id", "github_repository_id", "period_type", "period_start"], name: "idx_metric_snapshots_unique", unique: true
    t.index ["workspace_id", "period_type", "period_end"], name: "idx_on_workspace_id_period_type_period_end_6b1dcb31a1"
  end

  create_table "github_pull_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "github_repository_id", null: false
    t.uuid "author_id"
    t.bigint "github_id", null: false
    t.integer "number", null: false
    t.string "title", null: false
    t.text "body"
    t.string "state", null: false
    t.boolean "draft", default: false
    t.integer "additions", default: 0
    t.integer "deletions", default: 0
    t.integer "changed_files", default: 0
    t.integer "commits_count", default: 0
    t.datetime "opened_at", null: false
    t.datetime "closed_at"
    t.datetime "merged_at"
    t.datetime "first_review_at"
    t.string "merged_by_login"
    t.string "head_ref"
    t.string "base_ref"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_github_pull_requests_on_author_id"
    t.index ["github_repository_id", "github_id"], name: "idx_on_github_repository_id_github_id_2f4ace0320", unique: true
    t.index ["github_repository_id", "number"], name: "index_github_pull_requests_on_github_repository_id_and_number", unique: true
    t.index ["github_repository_id", "opened_at"], name: "idx_on_github_repository_id_opened_at_08b9d96cdb"
    t.index ["github_repository_id", "state"], name: "index_github_pull_requests_on_github_repository_id_and_state"
    t.index ["merged_at"], name: "index_github_pull_requests_on_merged_at"
    t.index ["opened_at"], name: "index_github_pull_requests_on_opened_at"
    t.index ["state"], name: "index_github_pull_requests_on_state"
  end

  create_table "github_repositories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "github_installation_id", null: false
    t.bigint "github_id", null: false
    t.string "name", null: false
    t.string "full_name", null: false
    t.boolean "private", default: false
    t.string "default_branch", default: "main"
    t.string "language"
    t.text "description"
    t.boolean "sync_enabled", default: true
    t.datetime "last_synced_at"
    t.jsonb "sync_metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["full_name"], name: "index_github_repositories_on_full_name"
    t.index ["github_id"], name: "index_github_repositories_on_github_id", unique: true
    t.index ["github_installation_id", "sync_enabled"], name: "idx_on_github_installation_id_sync_enabled_958785057a"
    t.index ["github_installation_id"], name: "index_github_repositories_on_github_installation_id"
  end

  create_table "github_reviews", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "github_pull_request_id", null: false
    t.uuid "reviewer_id"
    t.bigint "github_id", null: false
    t.string "state", null: false
    t.text "body"
    t.datetime "submitted_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["github_pull_request_id", "github_id"], name: "index_github_reviews_on_github_pull_request_id_and_github_id", unique: true
    t.index ["github_pull_request_id", "reviewer_id"], name: "index_github_reviews_on_github_pull_request_id_and_reviewer_id"
    t.index ["reviewer_id"], name: "index_github_reviews_on_reviewer_id"
    t.index ["submitted_at"], name: "index_github_reviews_on_submitted_at"
  end

  create_table "insight_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.string "query_type", null: false
    t.text "custom_query"
    t.datetime "date_range_start", null: false
    t.datetime "date_range_end", null: false
    t.jsonb "project_ids", default: []
    t.jsonb "person_ids", default: []
    t.string "status", default: "pending", null: false
    t.jsonb "result_payload"
    t.text "content"
    t.string "result_model"
    t.integer "prompt_tokens"
    t.integer "completion_tokens"
    t.text "error_message"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.string "perspective"
    t.index ["deleted_at"], name: "index_insight_requests_on_deleted_at"
    t.index ["user_id", "created_at"], name: "index_insight_requests_on_user_id_and_created_at"
    t.index ["user_id", "status"], name: "index_insight_requests_on_user_id_and_status"
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
    t.uuid "github_repository_id"
    t.index ["github_repository_id"], name: "index_projects_on_github_repository_id"
    t.index ["user_id", "name"], name: "index_projects_on_user_id_and_name"
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "user_agent"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "current_workspace_id"
    t.index ["current_workspace_id"], name: "index_sessions_on_current_workspace_id"
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "signal_entities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "signal_id", null: false
    t.string "entity_type", null: false
    t.string "name", null: false
    t.string "mentionable_type"
    t.uuid "mentionable_id"
    t.integer "count", default: 1
    t.datetime "last_seen_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["mentionable_type", "mentionable_id"], name: "index_signal_entities_on_mentionable_type_and_mentionable_id"
    t.index ["signal_id"], name: "index_signal_entities_on_signal_id"
  end

  create_table "signal_entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "signal_id", null: false
    t.uuid "entry_id", null: false
    t.string "role", default: "evidence", null: false
    t.text "excerpt"
    t.float "score", default: 0.0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["entry_id"], name: "index_signal_entries_on_entry_id"
    t.index ["signal_id", "entry_id"], name: "index_signal_entries_on_signal_id_and_entry_id", unique: true
    t.index ["signal_id", "role"], name: "index_signal_entries_on_signal_id_and_role"
  end

  create_table "signals", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "signal_type", null: false
    t.string "entity_name", null: false
    t.string "status", default: "active", null: false
    t.string "title", null: false
    t.integer "confidence", default: 0, null: false
    t.datetime "first_detected_at", null: false
    t.datetime "last_detected_at", null: false
    t.datetime "seen_at"
    t.string "source", default: "ai", null: false
    t.jsonb "metadata", default: {}
    t.jsonb "context_payload", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["last_detected_at"], name: "index_signals_on_last_detected_at"
    t.index ["user_id", "entity_name", "signal_type"], name: "index_signals_unique_pattern", unique: true
    t.index ["user_id", "signal_type", "status"], name: "index_signals_on_user_id_and_signal_type_and_status"
    t.index ["user_id", "status"], name: "index_signals_on_user_id_and_status"
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

  create_table "workspace_memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workspace_id", null: false
    t.uuid "user_id", null: false
    t.integer "role", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "workspace_id"], name: "index_workspace_memberships_on_user_id_and_workspace_id"
    t.index ["workspace_id", "role"], name: "index_workspace_memberships_on_workspace_id_and_role"
    t.index ["workspace_id", "user_id"], name: "index_workspace_memberships_on_workspace_id_and_user_id", unique: true
  end

  create_table "workspaces", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.uuid "owner_id", null: false
    t.jsonb "settings", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_workspaces_on_owner_id"
    t.index ["slug"], name: "index_workspaces_on_slug", unique: true
  end

  add_foreign_key "contributor_person_links", "github_contributors"
  add_foreign_key "contributor_person_links", "persons"
  add_foreign_key "contributor_person_links", "users"
  add_foreign_key "entries", "users"
  add_foreign_key "entry_mentions", "entries"
  add_foreign_key "github_commits", "github_contributors", column: "author_id", on_delete: :nullify
  add_foreign_key "github_commits", "github_repositories", on_delete: :cascade
  add_foreign_key "github_contributors", "workspaces", on_delete: :cascade
  add_foreign_key "github_installations", "workspaces", on_delete: :cascade
  add_foreign_key "github_issues", "github_contributors", column: "author_id", on_delete: :nullify
  add_foreign_key "github_issues", "github_repositories", on_delete: :cascade
  add_foreign_key "github_metric_snapshots", "github_contributors", on_delete: :cascade
  add_foreign_key "github_metric_snapshots", "github_repositories", on_delete: :cascade
  add_foreign_key "github_metric_snapshots", "workspaces", on_delete: :cascade
  add_foreign_key "github_pull_requests", "github_contributors", column: "author_id", on_delete: :nullify
  add_foreign_key "github_pull_requests", "github_repositories", on_delete: :cascade
  add_foreign_key "github_repositories", "github_installations", on_delete: :cascade
  add_foreign_key "github_reviews", "github_contributors", column: "reviewer_id", on_delete: :nullify
  add_foreign_key "github_reviews", "github_pull_requests", on_delete: :cascade
  add_foreign_key "insight_requests", "users"
  add_foreign_key "notification_deliveries", "notification_schedules"
  add_foreign_key "notification_deliveries", "users"
  add_foreign_key "notification_schedules", "users"
  add_foreign_key "persons", "users"
  add_foreign_key "project_persons", "persons"
  add_foreign_key "project_persons", "projects"
  add_foreign_key "projects", "github_repositories"
  add_foreign_key "projects", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "sessions", "workspaces", column: "current_workspace_id", on_delete: :nullify
  add_foreign_key "signal_entities", "signals", on_delete: :cascade
  add_foreign_key "signal_entries", "entries", on_delete: :cascade
  add_foreign_key "signal_entries", "signals", on_delete: :cascade
  add_foreign_key "signals", "users"
  add_foreign_key "workspace_memberships", "users", on_delete: :cascade
  add_foreign_key "workspace_memberships", "workspaces", on_delete: :cascade
  add_foreign_key "workspaces", "users", column: "owner_id"
end
