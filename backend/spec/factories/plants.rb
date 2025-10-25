FactoryBot.define do
  factory :plant do
    sequence(:name) { |n| "野菜#{n}" }
    sequence(:description) { |n| "野菜#{n}の説明です" }
  end
end
