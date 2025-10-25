require 'rails_helper'

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/login" do
    let(:user) { create(:user, :verified, password: "password123") }

    context "正しい認証情報の場合" do
      it "トークンを返す" do
        post "/api/v1/auth/login", params: { email: user.email, password: "password123" }

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data]).to have_key(:token)
        expect(json[:data][:user][:email]).to eq(user.email)
      end
    end

    context "メール未認証の場合" do
      let(:unverified_user) { create(:user, password: "password123", email_verified: false) }

      it "403エラーを返す" do
        post "/api/v1/auth/login", params: { email: unverified_user.email, password: "password123" }

        expect(response).to have_http_status(:forbidden)
        json = json_response
        expect(json[:success]).to be false
        expect(json[:error][:code]).to eq("EMAIL_NOT_VERIFIED")
      end
    end

    context "パスワードが間違っている場合" do
      it "401エラーを返す" do
        post "/api/v1/auth/login", params: { email: user.email, password: "wrongpassword" }

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end

  describe "GET /api/v1/auth/me" do
    let(:user) { create(:user, :verified) }

    context "認証済みの場合" do
      it "現在のユーザー情報を返す" do
        get "/api/v1/auth/me", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:user][:id]).to eq(user.id)
        expect(json[:data][:user][:email]).to eq(user.email)
      end
    end

    context "未認証の場合" do
    it "422エラーを返す" do
      get "/api/v1/auth/me"

      expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    let(:user) { create(:user, :verified) }

    it "ログアウトが成功する" do
      delete "/api/v1/auth/logout", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end
end
