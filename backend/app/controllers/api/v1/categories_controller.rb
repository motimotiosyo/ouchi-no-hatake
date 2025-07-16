class Api::V1::CategoriesController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index ]

  def index
    begin
      categories = Category.all.order(:name)

      categories_data = categories.map do |category|
        {
          id: category.id,
          name: category.name
        }
      end

      render json: {
        categories: categories_data
      }
    rescue => e
      Rails.logger.error "Error in CategoriesController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "カテゴリの取得に失敗しました"
      }, status: :internal_server_error
    end
  end
end
