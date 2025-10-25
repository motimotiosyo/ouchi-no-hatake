require 'rails_helper'

RSpec.describe "Api::V1::Notifications", type: :request do
  let(:user) { create(:user, :verified) }
  let(:other_user) { create(:user, :verified) }
  let(:category) { create(:category) }
  let(:post_record) { create(:post, user: user, category: category) }
  let!(:notification) { create(:notification, user: user, actor: other_user, notifiable: post_record) }

  describe "GET /api/v1/notifications" do
    context "認証済みの場合" do
      it "通知一覧を取得できる" do
        get "/api/v1/notifications", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:notifications]).to be_an(Array)
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        get "/api/v1/notifications"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/v1/notifications/:id/mark_as_read" do
    it "通知を既読にできる" do
      patch "/api/v1/notifications/#{notification.id}/mark_as_read", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end
end
