FactoryBot.define do
  factory :growth_record_step do
    association :growth_record
    association :guide_step
    done { false }

    trait :completed do
      done { true }
    end
  end
end
