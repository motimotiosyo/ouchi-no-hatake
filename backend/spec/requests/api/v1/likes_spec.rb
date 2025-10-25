require 'rails_helper'

RSpec.describe "Api::V1::Likes", type: :request do
  let(:user) { create(:user, :verified) }
  let(:category) { create(:category) }
  let(:post_record) { create(:post, user: user, category: category) }

  describe "POST /api/v1/posts/:post_id/likes" do
    context "正しいパラメータの場合" do
      it "いいねを作成できる" do
        post "/api/v1/posts/#{post_record.id}/likes", headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        post "/api/v1/posts/#{post_record.id}/likes"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "重複いいねの場合" do
      before do
        create(:like, post: post_record, user: user)
      end

      it "422エラーを返す" do
        post "/api/v1/posts/#{post_record.id}/likes", headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end

  describe "DELETE /api/v1/posts/:post_id/likes" do
    before do
      create(:like, post: post_record, user: user)
    end

    context "認証済みの場合" do
      it "いいねを削除できる" do
        delete "/api/v1/posts/#{post_record.id}/likes", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        delete "/api/v1/posts/#{post_record.id}/likes"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
