require 'rails_helper'

RSpec.describe "Api::V1::Guides", type: :request do
  let(:plant) { create(:plant) }
  let!(:guide) { create(:guide, plant: plant) }

  describe "GET /api/v1/guides" do
    it "ガイド一覧を取得できる" do
      get "/api/v1/guides", headers: auth_headers(create(:user, :verified))

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end

  describe "GET /api/v1/guides/:id" do
    context "存在するガイドの場合" do
      it "ガイド詳細を取得できる" do
        get "/api/v1/guides/#{guide.id}", headers: auth_headers(create(:user, :verified))

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "存在しないガイドの場合" do
      it "404エラーを返す" do
        get "/api/v1/guides/99999", headers: auth_headers(create(:user, :verified))

        expect(response).to have_http_status(:not_found)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end
end
