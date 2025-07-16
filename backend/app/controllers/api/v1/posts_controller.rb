class Api::V1::PostsController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index ]
  before_action :set_post, only: [:show, :update, :destroy]
  
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
        },
        category: {
          id: post.category.id,
          name: post.category.name
        }
      }
      
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
          },
          category: {
            id: @post.category.id,
            name: @post.category.name
          }
        }
        
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
        
        render json: { post: post_response }, status: :created
      else
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
          },
          category: {
            id: @post.category.id,
            name: @post.category.name
          }
        }
        
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
    params.require(:post).permit(:title, :content, :growth_record_id, :category_id, :post_type)
  end
end
