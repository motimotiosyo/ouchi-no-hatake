require 'rails_helper'

RSpec.describe "Api::V1::Categories", type: :request do
  let!(:categories) { create_list(:category, 3) }

  describe "GET /api/v1/categories" do
    it "カテゴリー一覧を取得できる" do
      get "/api/v1/categories"

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end
end
