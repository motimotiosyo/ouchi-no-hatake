class Api::V1::PostsController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index ]
  def index
    begin
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10
      offset = (page - 1) * per_page

      posts = Post.timeline.limit(per_page).offset(offset)
      total_count = Post.where(destination_type: :public_post).count
      has_more = (offset + per_page) < total_count

    posts_data = posts.map do |post|
      {
        id: post.id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        user: {
          id: post.user.id,
          name: post.user.name
        },
        growth_record: {
          id: post.growth_record.id,
          record_name: post.growth_record.record_name,
          plant: {
            id: post.growth_record.plant.id,
            name: post.growth_record.plant.name
          }
        },
        category: {
          id: post.category.id,
          name: post.category.name
        }
      }
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
end
