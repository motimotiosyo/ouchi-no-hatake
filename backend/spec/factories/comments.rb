FactoryBot.define do
  factory :comment do
    association :user
    association :post
    sequence(:content) { |n| "コメント内容#{n}" }

    trait :reply do
      association :parent_comment, factory: :comment
    end
  end
end
