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

ActiveRecord::Schema[7.2].define(version: 2025_10_18_021836) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "choice_scores", force: :cascade do |t|
    t.bigint "choice_id", null: false
    t.bigint "plant_id", null: false
    t.integer "score"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["choice_id"], name: "index_choice_scores_on_choice_id"
    t.index ["plant_id"], name: "index_choice_scores_on_plant_id"
  end

  create_table "choices", force: :cascade do |t|
    t.bigint "question_id", null: false
    t.string "text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["question_id"], name: "index_choices_on_question_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.string "content", limit: 255, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "parent_comment_id"
    t.index ["parent_comment_id"], name: "index_comments_on_parent_comment_id"
    t.index ["post_id", "created_at"], name: "index_comments_on_post_id_and_created_at"
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "favorite_growth_records", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "growth_record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["growth_record_id"], name: "index_favorite_growth_records_on_growth_record_id"
    t.index ["user_id", "growth_record_id"], name: "index_favorite_growth_records_on_user_and_growth_record", unique: true
    t.index ["user_id"], name: "index_favorite_growth_records_on_user_id"
  end

  create_table "follows", force: :cascade do |t|
    t.bigint "follower_id", null: false
    t.bigint "followee_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["followee_id"], name: "index_follows_on_followee_id"
    t.index ["follower_id", "followee_id"], name: "index_follows_on_follower_id_and_followee_id", unique: true
    t.index ["follower_id"], name: "index_follows_on_follower_id"
  end

  create_table "growth_record_sequences", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "plant_id", null: false
    t.integer "last_number", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["plant_id"], name: "index_growth_record_sequences_on_plant_id"
    t.index ["user_id", "plant_id"], name: "index_growth_record_sequences_on_user_id_and_plant_id", unique: true
    t.index ["user_id"], name: "index_growth_record_sequences_on_user_id"
  end

  create_table "growth_record_steps", force: :cascade do |t|
    t.bigint "growth_record_id", null: false
    t.bigint "guide_step_id", null: false
    t.date "scheduled_on"
    t.boolean "done"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "completed_at"
    t.index ["growth_record_id"], name: "index_growth_record_steps_on_growth_record_id"
    t.index ["guide_step_id"], name: "index_growth_record_steps_on_guide_step_id"
  end

  create_table "growth_records", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "plant_id", null: false
    t.integer "record_number"
    t.string "record_name"
    t.string "location"
    t.date "started_on"
    t.date "ended_on"
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "guide_id"
    t.integer "planting_method", default: 0
    t.index ["guide_id"], name: "index_growth_records_on_guide_id"
    t.index ["plant_id"], name: "index_growth_records_on_plant_id"
    t.index ["user_id"], name: "index_growth_records_on_user_id"
  end

  create_table "guide_steps", force: :cascade do |t|
    t.bigint "guide_id", null: false
    t.string "title"
    t.text "description"
    t.integer "position"
    t.integer "due_days"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "phase", default: 0, null: false
    t.string "applicable_to", default: "all", null: false
    t.index ["guide_id", "phase"], name: "index_guide_steps_on_guide_id_and_phase"
    t.index ["guide_id"], name: "index_guide_steps_on_guide_id"
  end

  create_table "guides", force: :cascade do |t|
    t.bigint "plant_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "planting_months"
    t.string "transplanting_months"
    t.string "pruning_months"
    t.string "fertilizing_months"
    t.string "harvesting_months"
    t.index ["plant_id"], name: "index_guides_on_plant_id"
  end

  create_table "jwt_blacklists", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "expires_at", precision: nil, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_jwt_blacklists_on_expires_at"
    t.index ["jti"], name: "index_jwt_blacklists_on_jti", unique: true
  end

  create_table "likes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_likes_on_post_id"
    t.index ["user_id", "post_id"], name: "index_likes_on_user_id_and_post_id", unique: true
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "password_reset_tokens", force: :cascade do |t|
    t.string "email", null: false
    t.string "token", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_password_reset_tokens_on_email"
    t.index ["expires_at"], name: "index_password_reset_tokens_on_expires_at"
    t.index ["token"], name: "index_password_reset_tokens_on_token", unique: true
  end

  create_table "plants", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "growth_record_id"
    t.bigint "category_id"
    t.string "title", default: ""
    t.text "content"
    t.integer "post_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_posts_on_category_id"
    t.index ["growth_record_id"], name: "index_posts_on_growth_record_id"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "questions", force: :cascade do |t|
    t.string "text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "name"
    t.text "bio"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "email_verified", default: false, null: false
    t.string "email_verification_token"
    t.datetime "email_verification_sent_at"
    t.index ["email_verification_token"], name: "index_users_on_email_verification_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "choice_scores", "choices"
  add_foreign_key "choice_scores", "plants"
  add_foreign_key "choices", "questions"
  add_foreign_key "comments", "comments", column: "parent_comment_id"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "favorite_growth_records", "growth_records"
  add_foreign_key "favorite_growth_records", "users"
  add_foreign_key "follows", "users", column: "followee_id"
  add_foreign_key "follows", "users", column: "follower_id"
  add_foreign_key "growth_record_sequences", "plants"
  add_foreign_key "growth_record_sequences", "users"
  add_foreign_key "growth_record_steps", "growth_records"
  add_foreign_key "growth_record_steps", "guide_steps"
  add_foreign_key "growth_records", "guides"
  add_foreign_key "growth_records", "plants"
  add_foreign_key "growth_records", "users"
  add_foreign_key "guide_steps", "guides"
  add_foreign_key "guides", "plants"
  add_foreign_key "likes", "posts"
  add_foreign_key "likes", "users"
  add_foreign_key "posts", "categories"
  add_foreign_key "posts", "growth_records"
  add_foreign_key "posts", "users"
end
