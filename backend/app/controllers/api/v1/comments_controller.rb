class Api::V1::CommentsController < ApplicationController
  before_action :find_post
  before_action :find_comment, only: [ :destroy ]

  # GET /api/v1/posts/:post_id/comments
  def index
    if params[:flat] == "true"
      # フラットな時系列表示（X仕様）
      all_comments = @post.comments.includes(:user, :parent_comment).order(created_at: :desc)
      comments_data = CommentService.build_flat_comments_data(all_comments)
    else
      # ネスト構造（従来の表示）
      top_level_comments = @post.comments.top_level.includes(:user, replies: [ :user ]).order(created_at: :desc)
      comments_data = CommentService.build_nested_comments_data(top_level_comments)
    end
    
    render json: { comments: comments_data }
  end

  # POST /api/v1/posts/:post_id/comments
  def create
    begin
      result = CommentService.create_comment(@post, current_user, comment_params)
      render json: { comment: result.data }, status: :created

    rescue CommentService::ValidationError => e
      render json: { 
        errors: e.details || [e.message]
      }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in CommentsController#create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { 
        errors: ["コメントの作成に失敗しました"]
      }, status: :internal_server_error
    end
  end

  # DELETE /api/v1/posts/:post_id/comments/:id
  def destroy
    begin
      if @comment.user == current_user
        @comment.destroy
        render json: { message: "コメントを削除しました" }
      else
        render json: { error: "権限がありません" }, status: :forbidden
      end
    rescue => e
      Rails.logger.error "Error in CommentsController#destroy: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "コメントの削除に失敗しました" }, status: :internal_server_error
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
end
