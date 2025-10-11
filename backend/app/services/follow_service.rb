class FollowService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class AuthorizationError < StandardError; end
  class SelfFollowError < StandardError; end
  class AlreadyFollowingError < StandardError; end

  # フォロー作成
  def self.follow(followee, follower)
    # 自分自身のフォローチェック
    if followee.id == follower.id
      raise SelfFollowError.new("自分自身をフォローすることはできません")
    end

    # 既にフォロー済みかチェック
    if follower.following?(followee)
      raise AlreadyFollowingError.new("既にフォロー済みです")
    end

    follow = Follow.new(follower: follower, followee: followee)

    if follow.save
      ApplicationSerializer.success(
        data: {
          message: "フォローしました",
          follow: {
            id: follow.id,
            follower_id: follower.id,
            followee_id: followee.id
          }
        }
      )
    else
      raise ValidationError.new(
        "フォローに失敗しました",
        follow.errors.full_messages
      )
    end
  end

  # フォロー解除
  def self.unfollow(followee, follower)
    follow = Follow.find_by(follower: follower, followee: followee)

    unless follow
      raise ValidationError.new("フォローしていません")
    end

    if follow.destroy
      ApplicationSerializer.success(
        data: { message: "フォローを解除しました" }
      )
    else
      raise ValidationError.new("フォロー解除に失敗しました")
    end
  end
end
