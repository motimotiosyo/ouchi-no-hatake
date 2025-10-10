# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
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

      private

      def user_params
        params.require(:user).permit(:name, :bio, :avatar, :remove_avatar)
      end
    end
  end
end
