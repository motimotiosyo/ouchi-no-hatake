class Api::V1::LikesController < ApplicationController
  before_action :find_post

  # POST /api/v1/posts/:post_id/likes
  def create
    Rails.logger.info "Like create - User: #{current_user.id}, Post: #{@post.id}"
    
    like = @post.likes.build(user: current_user)

    if like.save
      Rails.logger.info "Like created successfully"
      render json: {
        message: "いいねしました",
        likes_count: @post.likes_count,
        liked: true
      }, status: :created
    else
      Rails.logger.error "Like creation failed: #{like.errors.full_messages.join(', ')}"
      render json: {
        error: like.errors.full_messages.first || "いいねに失敗しました"
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotUnique => e
    Rails.logger.error "Duplicate like attempted: #{e.message}"
    render json: {
      error: "既にいいね済みです"
    }, status: :unprocessable_entity
  rescue => e
    Rails.logger.error "Unexpected error in likes#create: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: {
      error: '予期しないエラーが発生しました'
    }, status: :internal_server_error
  end

  # DELETE /api/v1/posts/:post_id/likes
  def destroy
    like = @post.likes.find_by(user: current_user)

    if like
      like.destroy
      render json: {
        message: "いいねを取り消しました",
        likes_count: @post.likes_count,
        liked: false
      }, status: :ok
    else
      render json: {
        error: "いいねが見つかりません"
      }, status: :not_found
    end
  end

  private

  def find_post
    Rails.logger.info "Finding post with ID: #{params[:post_id]}"
    @post = Post.find(params[:post_id])
    Rails.logger.info "Post found: #{@post.id}"
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "Post not found: #{params[:post_id]}"
    render json: { error: "投稿が見つかりません" }, status: :not_found
  end
end
