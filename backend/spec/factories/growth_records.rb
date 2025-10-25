FactoryBot.define do
  factory :growth_record do
    association :user
    association :plant
    record_number { 1 }
    status { :planning }
    planting_method { :seed }
    started_on { nil }

    trait :growing do
      status { :growing }
      started_on { Date.today }
    end

    trait :completed do
      status { :completed }
      started_on { 3.months.ago.to_date }
    end

    trait :failed do
      status { :failed }
      started_on { 1.month.ago.to_date }
    end
  end
end
