class Api::V1::CommentsController < ApplicationController
  before_action :find_post
  before_action :find_comment, only: [:destroy]

  # GET /api/v1/posts/:post_id/comments
  def index
    if params[:flat] == 'true'
      # フラットな時系列表示（X仕様）
      all_comments = @post.comments.includes(:user, :parent_comment).order(created_at: :asc)
      render json: { comments: flat_comments_data(all_comments) }
    else
      # ネスト構造（従来の表示）
      top_level_comments = @post.comments.top_level.includes(:user, replies: [:user]).order(created_at: :asc)
      render json: { comments: nested_comments_data(top_level_comments) }
    end
  end

  # POST /api/v1/posts/:post_id/comments  
  def create
    comment = @post.comments.build(comment_params)
    comment.user = current_user
    
    if comment.save
      render json: { comment: comment_data(comment) }, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/posts/:post_id/comments/:id
  def destroy
    if @comment.user == current_user
      @comment.destroy
      render json: { message: 'コメントを削除しました' }
    else
      render json: { error: '権限がありません' }, status: :forbidden
    end
  end

  private

  def find_post
    @post = Post.find(params[:post_id])
  end

  def find_comment
    @comment = @post.comments.find(params[:id])
  end

  def comment_params
    params.require(:comment).permit(:content, :parent_comment_id)
  end

  def comment_data(comment)
    {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      parent_comment_id: comment.parent_comment_id,
      replies_count: comment.replies_count,
      user: {
        id: comment.user.id,
        name: comment.user.name
      }
    }
  end

  def nested_comments_data(comments)
    comments.map do |comment|
      comment_hash = comment_data(comment)
      # リプライも含める
      comment_hash[:replies] = comment.replies.order(created_at: :asc).map { |reply| comment_data(reply) }
      comment_hash
    end
  end

  def flat_comments_data(comments)
    comments.map do |comment|
      comment_hash = comment_data(comment)
      # リプライ元の情報を追加
      if comment.parent_comment
        comment_hash[:replying_to] = {
          id: comment.parent_comment.id,
          user_name: comment.parent_comment.user.name
        }
      end
      comment_hash
    end
  end

  def comments_data(comments)
    comments.map { |comment| comment_data(comment) }
  end
end