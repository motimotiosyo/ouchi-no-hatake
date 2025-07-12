class Api::V1::PostsController < ApplicationController
  def index
    posts = Post.timeline.limit(20)
    
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

    render json: { posts: posts_data }
  end
end