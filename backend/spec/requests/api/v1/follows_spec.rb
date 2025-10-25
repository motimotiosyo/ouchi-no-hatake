require 'rails_helper'

RSpec.describe "Api::V1::Follows", type: :request do
  let(:user) { create(:user, :verified) }
  let(:other_user) { create(:user, :verified) }

  describe "GET /api/v1/users/:user_id/followers" do
    before do
      create(:follow, follower: other_user, followee: user)
    end

    it "フォロワー一覧を取得できる" do
      get "/api/v1/users/#{user.id}/followers", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
      expect(json[:data][:followers].size).to eq(1)
    end
  end

  describe "GET /api/v1/users/:user_id/following" do
    before do
      create(:follow, follower: user, followee: other_user)
    end

    it "フォロー中一覧を取得できる" do
      get "/api/v1/users/#{user.id}/following", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
      expect(json[:data][:following].size).to eq(1)
    end
  end

  describe "POST /api/v1/users/:user_id/follow" do
    context "正しいパラメータの場合" do
      it "フォローできる" do
        post "/api/v1/users/#{other_user.id}/follow", headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        post "/api/v1/users/#{other_user.id}/follow"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "DELETE /api/v1/users/:user_id/follow" do
    before do
      create(:follow, follower: user, followee: other_user)
    end

    context "認証済みの場合" do
      it "フォロー解除できる" do
        delete "/api/v1/users/#{other_user.id}/follow", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        delete "/api/v1/users/#{other_user.id}/follow"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
