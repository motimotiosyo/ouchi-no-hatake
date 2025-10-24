class LikeService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class AuthorizationError < StandardError; end
  class DuplicateLikeError < StandardError; end

  # いいね作成
  def self.create_like(post, user)
    like = post.likes.build(user: user)

    if like.save
      # 通知を作成
      NotificationService.create_like_notification(post, user)

      ApplicationSerializer.success(
        data: build_like_response(post, true)
      )
    else
      raise ValidationError.new(
        like.errors.full_messages.first || "いいねに失敗しました",
        like.errors.full_messages
      )
    end
  rescue ActiveRecord::RecordNotUnique => e
    raise DuplicateLikeError.new("既にいいね済みです")
  end

  # いいね削除
  def self.delete_like(post, user)
    like = post.likes.find_by(user: user)

    if like
      like.destroy
      ApplicationSerializer.success(
        data: build_like_response(post, false)
      )
    else
      ApplicationSerializer.error(
        message: "いいねが見つかりません",
        code: "NOT_FOUND"
      )
    end
  end

  private

  # いいねレスポンス構築
  def self.build_like_response(post, liked)
    {
      message: liked ? "いいねしました" : "いいねを取り消しました",
      likes_count: post.likes_count,
      liked: liked
    }
  end
end
