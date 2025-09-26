class Api::V1::LikesController < ApplicationController
  before_action :find_post

  # POST /api/v1/posts/:post_id/likes
  def create
    begin
      result = LikeService.create_like(@post, current_user)
      render json: result.data, status: :created

    rescue LikeService::DuplicateLikeError => e
      render json: {
        error: e.message
      }, status: :unprocessable_entity
    rescue LikeService::ValidationError => e
      Rails.logger.error "Like creation failed: #{e.details&.join(', ')}"
      render json: {
        error: e.message
      }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Unexpected error in likes#create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "予期しないエラーが発生しました"
      }, status: :internal_server_error
    end
  end

  # DELETE /api/v1/posts/:post_id/likes
  def destroy
    begin
      result = LikeService.delete_like(@post, current_user)

      if result.success
        render json: result.data, status: :ok
      else
        render json: {
          error: result.error
        }, status: :not_found
      end
    rescue => e
      Rails.logger.error "Error in LikesController#destroy: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "いいねの取り消しに失敗しました"
      }, status: :internal_server_error
    end
  end

  private

  def find_post
    @post = Post.find(params[:post_id])

  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "Post not found for provided ID"
    render json: { error: "投稿が見つかりません" }, status: :not_found
  end
end
