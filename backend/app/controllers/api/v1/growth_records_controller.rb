class Api::V1::GrowthRecordsController < ApplicationController
  skip_before_action :authenticate_request, only: [ :show ]
  before_action :set_growth_record, only: [ :update, :destroy ]
  before_action :set_growth_record_for_show, only: [ :show ]

  def index
    begin
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10
      offset = (page - 1) * per_page

      growth_records = current_user.growth_records
        .includes(:plant)
        .order(created_at: :desc)
        .limit(per_page)
        .offset(offset)

      total_count = current_user.growth_records.count
      pagination_info = GrowthRecordService.build_pagination_info(page, per_page, total_count)

      response_data = GrowthRecordService.build_growth_records_list(growth_records, pagination_info)
      render json: ApplicationSerializer.success(data: response_data)

    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "成長記録の取得に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  def show
    begin
      # トークンがあれば認証を試みる（オプショナル認証）
      set_optional_current_user

      posts = @growth_record.posts
        .includes(:user, :category)
        .order(created_at: :desc)

      response_data = GrowthRecordService.build_growth_record_detail(@growth_record, posts, current_user)
      render json: ApplicationSerializer.success(data: response_data)

    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#show: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "成長記録の詳細取得に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  def create
    begin
      result = GrowthRecordService.create_growth_record(current_user, growth_record_params)
      render json: result, status: :created

    rescue GrowthRecordService::ValidationError => e
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "VALIDATION_ERROR",
        details: e.details || []
      ), status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "成長記録の作成に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  def update
    begin
      result = GrowthRecordService.update_growth_record(@growth_record, growth_record_params)
      render json: result

    rescue GrowthRecordService::ValidationError => e
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "VALIDATION_ERROR",
        details: e.details || []
      ), status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#update: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "成長記録の更新に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  def destroy
    begin
      @growth_record.destroy
      render json: ApplicationSerializer.success(data: { message: "成長記録を削除しました" })
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#destroy: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "成長記録の削除に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  private

  def set_growth_record
    @growth_record = current_user.growth_records.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: ApplicationSerializer.error(
      message: "成長記録が見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  end

  def set_growth_record_for_show
    @growth_record = GrowthRecord.includes(:plant, :user).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: ApplicationSerializer.error(
      message: "成長記録が見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  end

  def growth_record_params
    params.require(:growth_record).permit(:plant_id, :record_name, :location, :started_on, :ended_on, :status, :thumbnail, :remove_thumbnail)
  end

  def set_optional_current_user
    header = request.headers["Authorization"]
    return unless header

    token = header.split(" ").last
    return if token.blank?

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id]) if decoded[:user_id]
    rescue => e
      # 認証エラーは無視（オプショナル認証のため）
      Rails.logger.info "Optional auth failed: #{e.message}"
    end
  end
end
