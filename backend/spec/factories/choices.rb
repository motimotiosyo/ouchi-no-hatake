FactoryBot.define do
  factory :choice do
    association :question
    sequence(:text) { |n| "選択肢#{n}" }
  end
end
