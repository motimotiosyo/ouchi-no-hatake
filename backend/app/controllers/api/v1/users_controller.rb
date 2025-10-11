# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authenticate_request, only: [ :show ]
      skip_before_action :check_email_verification, only: [ :show ]
      before_action :authenticate_request_optional, only: [ :show ]

      def show
        user = User.find(params[:id])
        user_data = UserService.build_user_response(user, current_user)

        render json: ApplicationSerializer.success(data: { user: user_data })
      rescue ActiveRecord::RecordNotFound
        render json: ApplicationSerializer.error(
          message: "ユーザーが見つかりません",
          code: "NOT_FOUND"
        ), status: :not_found
      rescue => e
        Rails.logger.error("ユーザー取得エラー: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: ApplicationSerializer.error(
          message: "ユーザー情報の取得に失敗しました",
          code: "INTERNAL_ERROR"
        ), status: :internal_server_error
      end

      def update_profile
        result = UserService.update_profile(current_user, user_params)
        render json: result, status: :ok
      rescue UserService::ValidationError => e
        render json: ApplicationSerializer.error(
          message: e.message,
          code: "VALIDATION_ERROR",
          details: e.details
        ), status: :unprocessable_entity
      rescue => e
        Rails.logger.error("プロフィール更新エラー: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: ApplicationSerializer.error(
          message: "プロフィールの更新に失敗しました",
          code: "INTERNAL_ERROR"
        ), status: :internal_server_error
      end

      def favorite_growth_records
        user = User.find(params[:id])
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 10
        offset = (page - 1) * per_page

        favorites = user.favorited_growth_records.limit(per_page).offset(offset)
        total_count = user.favorited_growth_records.count

        pagination_info = GrowthRecordService.build_pagination_info(page, per_page, total_count)
        response_data = GrowthRecordService.build_growth_records_list(favorites, pagination_info)

        render json: ApplicationSerializer.success(data: response_data)
      rescue ActiveRecord::RecordNotFound
        render json: ApplicationSerializer.error(
          message: "ユーザーが見つかりません",
          code: "NOT_FOUND"
        ), status: :not_found
      rescue => e
        Rails.logger.error("お気に入り一覧取得エラー: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: ApplicationSerializer.error(
          message: "お気に入り一覧の取得に失敗しました",
          code: "INTERNAL_ERROR"
        ), status: :internal_server_error
      end

      private

      def authenticate_request_optional
        header = request.headers["Authorization"]
        return if header.blank?

        header = header.split(" ").last if header
        return if header.blank?

        begin
          @decoded = JsonWebToken.decode(header)
          return if @decoded[:jti] && JwtBlacklist.blacklisted?(@decoded[:jti])

          @current_user = User.find(@decoded[:user_id])
        rescue => e
          @current_user = nil
        end
      end

      def user_params
        params.require(:user).permit(:name, :bio, :avatar, :remove_avatar)
      end
    end
  end
end
