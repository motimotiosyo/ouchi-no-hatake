FactoryBot.define do
  factory :user_provider do
    user { nil }
    provider { "MyString" }
    uid { "MyString" }
    email { "MyString" }
    access_token { "MyText" }
    refresh_token { "MyText" }
    expires_at { "2025-10-31 21:15:20" }
  end
end
