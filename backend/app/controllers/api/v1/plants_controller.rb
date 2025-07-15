class Api::V1::PlantsController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index ]

  def index
    begin
      plants = Plant.all.order(:name)

      plants_data = plants.map do |plant|
        {
          id: plant.id,
          name: plant.name,
          description: plant.description
        }
      end

      render json: {
        plants: plants_data
      }
    rescue => e
      Rails.logger.error "Error in PlantsController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "植物一覧の取得に失敗しました"
      }, status: :internal_server_error
    end
  end
end
