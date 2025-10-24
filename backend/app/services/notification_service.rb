class NotificationService < ApplicationService
  # いいね通知を作成
  def self.create_like_notification(post, actor)
    # 自分自身のアクションには通知しない
    return if post.user == actor

    Notification.create!(
      user: post.user,
      actor: actor,
      notifiable: post,
      notification_type: :like,
      message: "#{actor.name}さんがあなたの投稿にいいねしました"
    )
  end

  # コメント通知を作成
  def self.create_comment_notification(post, actor)
    # 自分自身のアクションには通知しない
    return if post.user == actor

    Notification.create!(
      user: post.user,
      actor: actor,
      notifiable: post,
      notification_type: :comment,
      message: "#{actor.name}さんがあなたの投稿にコメントしました"
    )
  end

  # リプライ通知を作成
  def self.create_reply_notification(comment, actor)
    # 自分自身のアクションには通知しない
    return if comment.user == actor

    Notification.create!(
      user: comment.user,
      actor: actor,
      notifiable: comment,
      notification_type: :reply,
      message: "#{actor.name}さんがあなたのコメントに返信しました"
    )
  end

  # お気に入り通知を作成
  def self.create_favorite_notification(growth_record, actor)
    # 自分自身のアクションには通知しない
    return if growth_record.user == actor

    Notification.create!(
      user: growth_record.user,
      actor: actor,
      notifiable: growth_record,
      notification_type: :favorite,
      message: "#{actor.name}さんがあなたの成長記録をお気に入りしました"
    )
  end
end
