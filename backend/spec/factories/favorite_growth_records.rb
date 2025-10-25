FactoryBot.define do
  factory :favorite_growth_record do
    association :user
    association :growth_record
  end
end
