class Api::V1::FavoriteGrowthRecordsController < ApplicationController
  before_action :find_growth_record

  # POST /api/v1/growth_records/:growth_record_id/favorite
  def create
    begin
      result = FavoriteGrowthRecordService.create_favorite(@growth_record, current_user)
      render json: result, status: :created

    rescue FavoriteGrowthRecordService::SelfFavoriteError => e
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "SELF_FAVORITE"
      ), status: :unprocessable_entity
    rescue FavoriteGrowthRecordService::DuplicateFavoriteError => e
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "DUPLICATE_FAVORITE"
      ), status: :unprocessable_entity
    rescue FavoriteGrowthRecordService::ValidationError => e
      Rails.logger.error "Favorite creation failed: #{e.details&.join(', ')}"
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "VALIDATION_ERROR"
      ), status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Unexpected error in favorite_growth_records#create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "予期しないエラーが発生しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  # DELETE /api/v1/growth_records/:growth_record_id/favorite
  def destroy
    begin
      result = FavoriteGrowthRecordService.delete_favorite(@growth_record, current_user)

      if result[:success]
        render json: result, status: :ok
      else
        render json: result, status: :not_found
      end
    rescue => e
      Rails.logger.error "Error in FavoriteGrowthRecordsController#destroy: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "お気に入りの解除に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  private

  def find_growth_record
    @growth_record = GrowthRecord.find(params[:growth_record_id])

  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "GrowthRecord not found for provided ID"
    render json: ApplicationSerializer.error(
      message: "成長記録が見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  end
end
