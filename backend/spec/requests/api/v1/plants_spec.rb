require 'rails_helper'

RSpec.describe "Api::V1::Plants", type: :request do
  let!(:plants) { create_list(:plant, 3) }

  describe "GET /api/v1/plants" do
    it "植物一覧を取得できる" do
      get "/api/v1/plants"

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end
end
