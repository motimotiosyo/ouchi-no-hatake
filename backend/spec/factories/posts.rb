FactoryBot.define do
  factory :post do
    association :user
    content { "テスト投稿の内容です。" }
    post_type { :general_post }

    trait :with_category do
      association :category
    end

    trait :growth_record_post do
      post_type { :growth_record_post }
      association :growth_record
    end
  end
end
