class Api::V1::PostsController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index, :show ]
  skip_before_action :check_email_verification, only: [ :index, :show ]

  # indexアクションで認証情報があれば取得する
  before_action :authenticate_request_optional, only: [ :index, :show ]
  before_action :set_post, only: [ :show, :update, :destroy ]

  def index
    begin
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10
      offset = (page - 1) * per_page

      posts = Post.timeline.limit(per_page).offset(offset)
      total_count = Post.count
      
      pagination_info = PostService.build_pagination_info(page, per_page, total_count)
      response_data = PostService.build_posts_list(posts, current_user, pagination_info)
      
      render json: response_data
    rescue => e
      Rails.logger.error "Error in PostsController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      empty_pagination = PostService.build_pagination_info(1, per_page, 0)
      render json: PostService.build_posts_list([], current_user, empty_pagination)
    end
  end

  def show
    begin
      post_data = PostService.build_post_response(@post, current_user)
      render json: post_data
    rescue => e
      Rails.logger.error "Error in PostsController#show: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "Internal server error" }, status: :internal_server_error
    end
  end

  def create
    begin


      # Content-Typeのミスマッチを検出
      if request.headers["Content-Type"]&.start_with?("multipart/form-data") && request.content_type == "application/json"
        Rails.logger.warn "Content-Type mismatch detected" if Rails.env.development?
      end

      result = PostService.create_post(current_user, post_params)
      render json: { post: result.data }, status: :created
    rescue PostService::ValidationError => e
      Rails.logger.error "Post validation failed: #{e.details&.join(', ')}" if e.details
      render json: {
        error: e.message,
        details: e.details
      }, status: :unprocessable_entity
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
      result = PostService.update_post(@post, post_params, current_user)
      render json: { post: result.data }
    rescue PostService::ValidationError => e
      render json: {
        error: e.message,
        details: e.details
      }, status: :unprocessable_entity
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

  def authenticate_request_optional
    header = request.headers["Authorization"]
    return if header.blank?

    header = header.split(" ").last if header
    return if header.blank?

    begin
      @decoded = JsonWebToken.decode(header)
      return if @decoded[:jti] && JwtBlacklist.blacklisted?(@decoded[:jti])

      @current_user = User.find(@decoded[:user_id])
    rescue => e

      @current_user = nil
    end
  end

  def set_post
    if action_name == "show"
      @post = Post.find(params[:id])
    else
      @post = current_user.posts.find(params[:id])
    end
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: "投稿が見つかりません"
    }, status: :not_found
  end


  def post_params
    permitted_params = params.require(:post).permit(:title, :content, :growth_record_id, :category_id, :post_type, images: [])

    permitted_params
  rescue ActionController::ParameterMissing => e
    Rails.logger.error "Parameter missing error: #{e.message}"
    Rails.logger.error "Available params keys: #{params.keys.inspect}"
    raise e
  end
end
