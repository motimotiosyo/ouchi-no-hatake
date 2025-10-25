FactoryBot.define do
  factory :notification do
    association :user
    association :actor, factory: :user
    association :notifiable, factory: :post
    notification_type { :like }
    message { "新しい通知があります" }
    read { false }

    trait :unread do
      read { false }
    end

    trait :read do
      read { true }
    end

    trait :like_notification do
      notification_type { :like }
      message { "あなたの投稿にいいねしました" }
    end

    trait :comment_notification do
      notification_type { :comment }
      message { "あなたの投稿にコメントしました" }
    end

    trait :reply_notification do
      notification_type { :reply }
      association :notifiable, factory: :comment
      message { "あなたのコメントに返信しました" }
    end

    trait :favorite_notification do
      notification_type { :favorite }
      association :notifiable, factory: :growth_record
      message { "あなたの成長記録をお気に入り登録しました" }
    end
  end
end
