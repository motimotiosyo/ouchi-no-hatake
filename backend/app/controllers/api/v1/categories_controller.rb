class Api::V1::CategoriesController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index ]
  skip_before_action :check_email_verification, only: [ :index ]

  def index
    begin
      categories = Category.all.order(:id)
      categories_data = categories.map { |category| { id: category.id, name: category.name } }

      render json: ApplicationSerializer.success(data: { categories: categories_data })
    rescue => e
      Rails.logger.error "Error in CategoriesController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      render json: ApplicationSerializer.error(
        message: "カテゴリの取得に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end
end
