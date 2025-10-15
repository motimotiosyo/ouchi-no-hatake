module Api
  module V1
    class GrowthRecordStepsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_growth_record
      before_action :set_growth_record_step, only: [ :complete, :uncomplete ]
      before_action :authorize_owner!

      def complete
        completed_at = params[:completed_at] ? Date.parse(params[:completed_at]) : nil
        result = GrowthRecordStepService.complete_step(@growth_record_step, completed_at)

        if result[:success]
          render json: ApplicationSerializer.success(result[:data]), status: :ok
        else
          render json: ApplicationSerializer.error(result[:error]), status: :unprocessable_entity
        end
      end

      def uncomplete
        result = GrowthRecordStepService.uncomplete_step(@growth_record_step)

        if result[:success]
          render json: ApplicationSerializer.success(result[:data]), status: :ok
        else
          render json: ApplicationSerializer.error(result[:error]), status: :unprocessable_entity
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
          render json: ApplicationSerializer.error("権限がありません"), status: :forbidden
        end
      end
    end
  end
end
