FactoryBot.define do
  factory :guide_step do
    association :guide
    sequence(:position) { |n| n }
    sequence(:title) { |n| "ステップ#{n}" }
    sequence(:description) { |n| "ステップ#{n}の説明です" }
    due_days { 0 }
  end
end
