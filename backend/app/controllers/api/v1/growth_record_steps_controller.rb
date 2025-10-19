module Api
  module V1
    class GrowthRecordStepsController < ApplicationController
      before_action :set_growth_record
      before_action :set_growth_record_step, only: [ :complete, :uncomplete ]
      before_action :authorize_owner!

      def complete
        unless params[:completed_at]
          render json: ApplicationSerializer.error(
            message: "完了日(completed_at)は必須です",
            code: "VALIDATION_ERROR"
          ), status: :bad_request
          return
        end

        completed_at = Date.parse(params[:completed_at])
        result = GrowthRecordStepService.complete_step(@growth_record_step, completed_at)

        if result[:success]
          render json: ApplicationSerializer.success(data: result[:data]), status: :ok
        else
          render json: ApplicationSerializer.error(
            message: result[:error],
            code: "VALIDATION_ERROR"
          ), status: :unprocessable_entity
        end
      rescue Date::Error
        render json: ApplicationSerializer.error(
          message: "completed_atの形式が不正です",
          code: "VALIDATION_ERROR"
        ), status: :bad_request
      end

      def uncomplete
        result = GrowthRecordStepService.uncomplete_step(@growth_record_step)

        if result[:success]
          render json: ApplicationSerializer.success(data: result[:data]), status: :ok
        else
          render json: ApplicationSerializer.error(
            message: result[:error],
            code: "VALIDATION_ERROR"
          ), status: :unprocessable_entity
        end
      end

      private

      def set_growth_record
        @growth_record = GrowthRecord.find(params[:growth_record_id])
      end

      def set_growth_record_step
        @growth_record_step = @growth_record.growth_record_steps.find(params[:id])
      end

      def authorize_owner!
        unless @growth_record.user_id == current_user.id
          render json: ApplicationSerializer.error(
            message: "権限がありません",
            code: "FORBIDDEN"
          ), status: :forbidden
        end
      end
    end
  end
end
