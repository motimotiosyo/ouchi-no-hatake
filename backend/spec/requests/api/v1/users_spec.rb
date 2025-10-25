require 'rails_helper'

RSpec.describe "Api::V1::Users", type: :request do
  let(:user) { create(:user, :verified) }

  describe "GET /api/v1/users/:id" do
    it "ユーザープロフィールを取得できる" do
      get "/api/v1/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
      expect(json[:data][:user][:id]).to eq(user.id)
    end
  end

  describe "PUT /api/v1/users/profile" do
    it "プロフィールを更新できる" do
      put "/api/v1/users/profile", params: { user: { name: "新しい名前" } }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end
end
