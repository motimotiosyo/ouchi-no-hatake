class Api::V1::CheckerController < ApplicationController
  # 未ログインユーザーもアクセス可能
  skip_before_action :authenticate_request, only: [ :questions, :diagnose ]
  skip_before_action :check_email_verification, only: [ :questions, :diagnose ]

  # GET /api/v1/checker/questions
  # 質問一覧を取得
  def questions
    begin
      result = CheckerService.fetch_questions
      render json: result
    rescue CheckerService::ValidationError => e
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "VALIDATION_ERROR",
        details: e.details || []
      ), status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in CheckerController#questions: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "質問の取得に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  # POST /api/v1/checker/diagnose
  # 診断を実行
  def diagnose
    begin
      choice_ids = diagnose_params[:choice_ids] || []
      result = CheckerService.diagnose(choice_ids)
      render json: result
    rescue CheckerService::ValidationError => e
      render json: ApplicationSerializer.error(
        message: e.message,
        code: "VALIDATION_ERROR",
        details: e.details || []
      ), status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in CheckerController#diagnose: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: ApplicationSerializer.error(
        message: "診断の実行に失敗しました",
        code: "INTERNAL_SERVER_ERROR"
      ), status: :internal_server_error
    end
  end

  private

  def diagnose_params
    params.permit(choice_ids: [])
  end
end
