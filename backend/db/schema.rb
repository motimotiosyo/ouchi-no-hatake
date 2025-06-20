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

ActiveRecord::Schema[7.2].define(version: 2025_06_19_171133) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

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

  create_table "growth_record_steps", force: :cascade do |t|
    t.bigint "growth_record_id", null: false
    t.bigint "guide_step_id", null: false
    t.date "scheduled_on"
    t.boolean "done"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.index ["guide_id"], name: "index_guide_steps_on_guide_id"
  end

  create_table "guides", force: :cascade do |t|
    t.bigint "plant_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["plant_id"], name: "index_guides_on_plant_id"
  end

  create_table "plants", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "growth_record_id", null: false
    t.bigint "category_id", null: false
    t.string "title"
    t.text "content"
    t.integer "destination_type"
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
  end

  add_foreign_key "choice_scores", "choices"
  add_foreign_key "choice_scores", "plants"
  add_foreign_key "choices", "questions"
  add_foreign_key "growth_record_steps", "growth_records"
  add_foreign_key "growth_record_steps", "guide_steps"
  add_foreign_key "growth_records", "plants"
  add_foreign_key "growth_records", "users"
  add_foreign_key "guide_steps", "guides"
  add_foreign_key "guides", "plants"
  add_foreign_key "posts", "categories"
  add_foreign_key "posts", "growth_records"
  add_foreign_key "posts", "users"
end
