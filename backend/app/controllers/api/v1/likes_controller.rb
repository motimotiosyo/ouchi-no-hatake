class Api::V1::LikesController < ApplicationController
  before_action :authenticate_user!
  before_action :find_post

  # POST /api/v1/posts/:post_id/likes
  def create
    like = @post.likes.build(user: current_user)
    
    if like.save
      render json: {
        message: 'いいねしました',
        likes_count: @post.likes_count,
        liked: true
      }, status: :created
    else
      render json: {
        message: like.errors.full_messages.first || 'いいねに失敗しました'
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotUnique
    # データベースレベルでの重複エラーをキャッチ
    render json: {
      message: '既にいいね済みです'
    }, status: :unprocessable_entity
  end

  # DELETE /api/v1/posts/:post_id/likes
  def destroy
    like = @post.likes.find_by(user: current_user)
    
    if like
      like.destroy
      render json: {
        message: 'いいねを取り消しました',
        likes_count: @post.likes_count,
        liked: false
      }, status: :ok
    else
      render json: {
        message: 'いいねが見つかりません'
      }, status: :not_found
    end
  end

  private

  def find_post
    @post = Post.find(params[:post_id])
  rescue ActiveRecord::RecordNotFound
    render json: { message: '投稿が見つかりません' }, status: :not_found
  end
end