class Api::V1::PostsController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index ]
  skip_before_action :check_email_verification, only: [ :index ]
  before_action :set_post, only: [ :update, :destroy ]

  def index
    begin
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10
      offset = (page - 1) * per_page

      posts = Post.timeline.limit(per_page).offset(offset)
      total_count = Post.count
      has_more = (offset + per_page) < total_count

    posts_data = posts.map do |post|
      post_data = {
        id: post.id,
        title: post.title,
        content: post.content,
        post_type: post.post_type,
        created_at: post.created_at,
        user: {
          id: post.user.id,
          name: post.user.name
        }
      }

      # カテゴリがある場合のみ追加
      if post.category
        post_data[:category] = {
          id: post.category.id,
          name: post.category.name
        }
      end

      # 成長記録がある場合のみ追加
      if post.growth_record
        post_data[:growth_record] = {
          id: post.growth_record.id,
          record_name: post.growth_record.record_name,
          plant: {
            id: post.growth_record.plant.id,
            name: post.growth_record.plant.name
          }
        }
      end

      # 画像URLを追加
      if post.images.attached?
        post_data[:images] = post.images.map { |image| Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true) }
      else
        post_data[:images] = []
      end

      post_data
    end

      render json: {
        posts: posts_data,
        pagination: {
          current_page: page,
          per_page: per_page,
          total_count: total_count,
          has_more: has_more
        }
      }
    rescue => e
      Rails.logger.error "Error in PostsController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        posts: [],
        pagination: {
          current_page: 1,
          per_page: per_page,
          total_count: 0,
          has_more: false
        }
      }
    end
  end

  def create
    begin
      Rails.logger.debug "Content-Type: #{request.content_type}"
      Rails.logger.debug "Request format: #{request.format}"
      Rails.logger.debug "Raw Content-Type header: #{request.headers['Content-Type']}"
      Rails.logger.debug "Request body size: #{request.raw_post.bytesize} bytes"

      # Content-Typeのミスマッチを検出
      if request.headers["Content-Type"]&.start_with?("multipart/form-data") && request.content_type == "application/json"
        Rails.logger.warn "Content-Type mismatch detected: header=#{request.headers['Content-Type']}, parsed=#{request.content_type}"
      end

      # 通常のRailsパラメータ処理を使用
      @post = current_user.posts.build(post_params)

      if @post.save
        post_response = {
          id: @post.id,
          title: @post.title,
          content: @post.content,
          post_type: @post.post_type,
          created_at: @post.created_at,
          updated_at: @post.updated_at,
          user: {
            id: @post.user.id,
            name: @post.user.name
          }
        }

        # カテゴリがある場合のみ追加
        if @post.category
          post_response[:category] = {
            id: @post.category.id,
            name: @post.category.name
          }
        end

        # 成長記録がある場合のみ追加
        if @post.growth_record
          post_response[:growth_record] = {
            id: @post.growth_record.id,
            record_name: @post.growth_record.record_name,
            plant: {
              id: @post.growth_record.plant.id,
              name: @post.growth_record.plant.name
            }
          }
        end

        # 画像URLを追加
        if @post.images.attached?
          post_response[:images] = @post.images.map { |image| Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true) }
        else
          post_response[:images] = []
        end

        render json: { post: post_response }, status: :created
      else
        Rails.logger.error "Post validation failed: #{@post.errors.full_messages.join(', ')}"
        Rails.logger.error "Post attributes: #{@post.attributes.inspect}"
        render json: {
          error: "投稿の作成に失敗しました",
          details: @post.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound => e
      render json: {
        error: "指定された成長記録またはカテゴリが見つかりません"
      }, status: :not_found
    rescue => e
      Rails.logger.error "Error in PostsController#create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "投稿の作成に失敗しました"
      }, status: :internal_server_error
    end
  end

  def update
    begin
      if @post.update(post_params)
        post_response = {
          id: @post.id,
          title: @post.title,
          content: @post.content,
          post_type: @post.post_type,
          created_at: @post.created_at,
          updated_at: @post.updated_at,
          user: {
            id: @post.user.id,
            name: @post.user.name
          }
        }

        # カテゴリがある場合のみ追加
        if @post.category
          post_response[:category] = {
            id: @post.category.id,
            name: @post.category.name
          }
        end

        # 成長記録がある場合のみ追加
        if @post.growth_record
          post_response[:growth_record] = {
            id: @post.growth_record.id,
            record_name: @post.growth_record.record_name,
            plant: {
              id: @post.growth_record.plant.id,
              name: @post.growth_record.plant.name
            }
          }
        end

        # 画像URLを追加
        if @post.images.attached?
          post_response[:images] = @post.images.map { |image| Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true) }
        else
          post_response[:images] = []
        end

        render json: { post: post_response }
      else
        render json: {
          error: "投稿の更新に失敗しました",
          details: @post.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound => e
      render json: {
        error: "指定された成長記録またはカテゴリが見つかりません"
      }, status: :not_found
    rescue => e
      Rails.logger.error "Error in PostsController#update: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "投稿の更新に失敗しました"
      }, status: :internal_server_error
    end
  end

  def destroy
    begin
      @post.destroy
      render json: { message: "投稿を削除しました" }
    rescue => e
      Rails.logger.error "Error in PostsController#destroy: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "投稿の削除に失敗しました"
      }, status: :internal_server_error
    end
  end

  private

  def set_post
    @post = current_user.posts.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: "投稿が見つかりません"
    }, status: :not_found
  end


  def post_params
    Rails.logger.debug "Available params keys: #{params.keys.inspect}"
    Rails.logger.debug "Post params keys: #{params[:post]&.keys&.inspect}"
    Rails.logger.debug "Images present: #{params[:post]&.[](:images).present?}"
    if params[:post]&.[](:images).present?
      Rails.logger.debug "Images count: #{params[:post][:images].size}"
    end

    permitted_params = params.require(:post).permit(:title, :content, :growth_record_id, :category_id, :post_type, images: [])
    permitted_params_safe = permitted_params.except(:images)
    Rails.logger.debug "Permitted params (without images): #{permitted_params_safe.inspect}"
    Rails.logger.debug "Images permitted: #{permitted_params[:images].present?}"
    permitted_params
  rescue ActionController::ParameterMissing => e
    Rails.logger.error "Parameter missing error: #{e.message}"
    Rails.logger.error "Available params keys: #{params.keys.inspect}"
    raise e
  end
end
