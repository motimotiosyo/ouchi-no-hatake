class CommentService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class AuthorizationError < StandardError; end

  # コメント作成
  def self.create_comment(post, user, params)
    comment = post.comments.build(params)
    comment.user = user

    if comment.save
      OpenStruct.new(
        success: true,
        comment: comment,
        data: build_comment_response(comment)
      )
    else
      raise ValidationError.new(
        "コメントの作成に失敗しました",
        comment.errors.full_messages
      )
    end
  end

  # フラット表示用コメントデータ構築
  def self.build_flat_comments_data(comments)
    comments.map do |comment|
      comment_hash = build_comment_response(comment)

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

  # ネスト表示用コメントデータ構築（再帰）
  def self.build_nested_comments_data(comments)
    comments.map do |comment|
      comment_hash = build_comment_response(comment)
      # リプライも再帰的に含める
      comment_hash[:replies] = build_nested_comments_data(
        comment.replies.includes(:user, replies: [ :user ]).order(created_at: :desc)
      )
      comment_hash
    end
  end

  private

  # 単一コメントのレスポンス構築
  def self.build_comment_response(comment)
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
end
