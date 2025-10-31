module Api
  module V1
    class OauthController < ApplicationController
      skip_before_action :authenticate_user!, only: [ :google_callback ]

      # Google OAuth コールバック
      def google_callback
        result = OauthService.authenticate_google(params[:credential])

        render json: ApplicationSerializer.success({
          user: build_user_response(result[:user]),
          token: result[:token]
        }), status: :ok
      rescue OauthService::AuthenticationError => e
        render json: ApplicationSerializer.error(e.message), status: :unauthorized
      end

      private

      def build_user_response(user)
        {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          created_at: user.created_at
        }
      end
    end
  end
end
