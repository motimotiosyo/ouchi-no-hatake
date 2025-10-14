class Api::V1::GuidesController < ApplicationController
  def index
    begin
      result = GuideService.fetch_guides
      render json: result
    rescue => e
      Logger.error "Error in GuidesController#index: #{e.message}"
      render json: ApplicationSerializer.error(
        message: "ガイド一覧の取得に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  def show
    begin
      result = GuideService.fetch_guide_detail(params[:id])
      render json: result
    rescue GuideService::ValidationError => e
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "NOT_FOUND"
      ), status: :not_found
    rescue => e
      Logger.error "Error in GuidesController#show: #{e.message}"
      render json: ApplicationSerializer.error(
        message: "ガイド詳細の取得に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end
end
