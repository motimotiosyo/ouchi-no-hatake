class PostService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class AuthorizationError < StandardError; end

  # 投稿一覧のレスポンス構築
  def self.build_posts_list(posts, current_user, pagination_info)
    posts_data = posts.map { |post| build_post_response(post, current_user) }

    {
      posts: posts_data,
      pagination: pagination_info
    }
  end

  # 単一投稿のレスポンス構築
  def self.build_post_response(post, current_user = nil)
    post_data = {
      id: post.id,
      title: post.title,
      content: post.content,
      post_type: post.post_type,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name
      }
    }

    # カテゴリ情報を追加
    if post.category
      post_data[:category] = {
        id: post.category.id,
        name: post.category.name
      }
    end

    # 成長記録情報を追加
    if post.growth_record
      growth_record_data = {
        id: post.growth_record.id,
        record_name: post.growth_record.record_name
      }

      # plant または custom_plant_name のいずれかが設定されている
      if post.growth_record.plant
        growth_record_data[:plant] = {
          id: post.growth_record.plant.id,
          name: post.growth_record.plant.name
        }
      elsif post.growth_record.custom_plant_name.present?
        growth_record_data[:plant] = {
          id: nil,
          name: post.growth_record.custom_plant_name
        }
      end

      post_data[:growth_record] = growth_record_data
    end

    # 画像URL生成
    post_data[:images] = build_image_urls(post)

    # いいね・コメント情報
    post_data[:likes_count] = post.likes_count
    post_data[:liked_by_current_user] = current_user ? post.liked_by?(current_user) : false
    post_data[:comments_count] = post.comments_count

    post_data
  end

  # 投稿作成
  def self.create_post(user, params)
    post = user.posts.build(params)

    if post.save
      ApplicationSerializer.success(
        data: build_post_response(post, user)
      )
    else
      raise ValidationError.new(
        "投稿の作成に失敗しました",
        post.errors.full_messages
      )
    end
  rescue ActiveRecord::RecordNotFound
    raise ValidationError.new("指定された成長記録またはカテゴリが見つかりません")
  end

  # 投稿更新
  def self.update_post(post, params, current_user)
    if post.update(params)
      ApplicationSerializer.success(
        data: build_post_response(post, current_user)
      )
    else
      raise ValidationError.new(
        "投稿の更新に失敗しました",
        post.errors.full_messages
      )
    end
  rescue ActiveRecord::RecordNotFound
    raise ValidationError.new("指定された成長記録またはカテゴリが見つかりません")
  end

  # ページネーション情報構築
  def self.build_pagination_info(page, per_page, total_count)
    offset = (page - 1) * per_page
    has_more = (offset + per_page) < total_count

    {
      current_page: page,
      per_page: per_page,
      total_count: total_count,
      has_more: has_more
    }
  end

  private

  # 画像URL生成（プライベートメソッド）
  def self.build_image_urls(post)
    if post.images.attached?
      post.images.map do |image|
        if Rails.env.development?
          Rails.application.routes.url_helpers.rails_blob_url(image, host: "http://localhost:3001")
        else
          # 本番環境ではS3の直接URLを返す
          image.url
        end
      end
    else
      []
    end
  end
end
