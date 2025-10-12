class FavoriteGrowthRecordService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class SelfFavoriteError < StandardError; end
  class DuplicateFavoriteError < StandardError; end

  # お気に入り作成
  def self.create_favorite(growth_record, user)
    # 自分の成長記録はお気に入りできない
    if growth_record.user_id == user.id
      raise SelfFavoriteError.new("自分の成長記録はお気に入りできません")
    end

    favorite = growth_record.favorite_growth_records.build(user: user)

    if favorite.save
      ApplicationSerializer.success(
        data: build_favorite_response(growth_record, true)
      )
    else
      raise ValidationError.new(
        favorite.errors.full_messages.first || "お気に入りに失敗しました",
        favorite.errors.full_messages
      )
    end
  rescue ActiveRecord::RecordNotUnique => e
    raise DuplicateFavoriteError.new("既にお気に入り済みです")
  end

  # お気に入り削除
  def self.delete_favorite(growth_record, user)
    favorite = growth_record.favorite_growth_records.find_by(user: user)

    if favorite
      favorite.destroy
      ApplicationSerializer.success(
        data: build_favorite_response(growth_record, false)
      )
    else
      ApplicationSerializer.error(
        message: "お気に入りが見つかりません",
        code: "NOT_FOUND"
      )
    end
  end

  private

  # お気に入りレスポンス構築
  def self.build_favorite_response(growth_record, favorited)
    {
      message: favorited ? "お気に入りに追加しました" : "お気に入りを解除しました",
      favorites_count: growth_record.favorites_count,
      favorited: favorited
    }
  end
end
