class Api::V1::CommentsController < ApplicationController
  before_action :find_post
  before_action :find_comment, only: [:destroy]

  # GET /api/v1/posts/:post_id/comments
  def index
    comments = @post.comments.includes(:user).order(created_at: :asc)
    render json: { comments: comments_data(comments) }
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
    params.require(:comment).permit(:content)
  end

  def comment_data(comment)
    {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        id: comment.user.id,
        name: comment.user.name
      }
    }
  end

  def comments_data(comments)
    comments.map { |comment| comment_data(comment) }
  end
end