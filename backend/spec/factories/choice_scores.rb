FactoryBot.define do
  factory :choice_score do
    association :choice
    association :plant
    score { 10 }
  end
end
