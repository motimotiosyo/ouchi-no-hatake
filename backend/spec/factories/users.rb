FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    sequence(:name) { |n| "テストユーザー#{n}" }
    password { "password123" }
    password_confirmation { "password123" }
    email_verified { false }
    email_verification_token { nil }
    email_verification_sent_at { nil }
    bio { "テストユーザーの自己紹介です。" }

    # メール認証済みユーザー
    trait :verified do
      email_verified { true }
      email_verification_token { nil }
      email_verification_sent_at { nil }
    end

    # メール未認証ユーザー（トークン発行済み）
    trait :unverified_with_token do
      email_verified { false }
      email_verification_token { SecureRandom.urlsafe_base64(32) }
      email_verification_sent_at { Time.current }
    end

    # 期限切れ未認証ユーザー
    trait :unverified_expired do
      email_verified { false }
      email_verification_token { SecureRandom.urlsafe_base64(32) }
      email_verification_sent_at { 25.hours.ago }
    end
  end
end
