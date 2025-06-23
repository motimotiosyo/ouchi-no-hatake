class Api::HealthCheckController < ApplicationController
  # ヘルスチェックなので認証スキップ
  skip_before_action :authenticate_request

  def index
    render json: { status: "ok" }, status: :ok
  end
end
