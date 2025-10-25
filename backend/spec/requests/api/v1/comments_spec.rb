require 'rails_helper'

RSpec.describe "Api::V1::Comments", type: :request do
  let(:user) { create(:user, :verified) }
  let(:other_user) { create(:user, :verified) }
  let(:category) { create(:category) }
  let(:post_record) { create(:post, user: user, category: category) }

  describe "GET /api/v1/posts/:post_id/comments" do
    let!(:comments) { create_list(:comment, 3, post: post_record, user: user) }

    context "認証済みの場合" do
      it "コメント一覧を取得できる" do
        get "/api/v1/posts/#{post_record.id}/comments", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:comments].size).to eq(3)
      end
    end

    context "フラット表示の場合" do
      it "フラットなコメント一覧を取得できる" do
        get "/api/v1/posts/#{post_record.id}/comments", params: { flat: "true" }, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:comments].size).to eq(3)
      end
    end
  end

  describe "POST /api/v1/posts/:post_id/comments" do
    context "正しいパラメータの場合" do
      it "コメントを作成できる" do
        comment_params = {
          comment: {
            content: "テストコメント"
          }
        }

        post "/api/v1/posts/#{post_record.id}/comments", params: comment_params, headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:comment][:content]).to eq("テストコメント")
      end
    end

    context "返信コメントの場合" do
      let(:parent_comment) { create(:comment, post: post_record, user: user) }

      it "返信コメントを作成できる" do
        comment_params = {
          comment: {
            content: "返信コメント",
            parent_comment_id: parent_comment.id
          }
        }

        post "/api/v1/posts/#{post_record.id}/comments", params: comment_params, headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:comment][:content]).to eq("返信コメント")
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        comment_params = {
          comment: {
            content: "テストコメント"
          }
        }

        post "/api/v1/posts/#{post_record.id}/comments", params: comment_params

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "不正なパラメータの場合" do
      it "422エラーを返す" do
        comment_params = {
          comment: {
            content: ""
          }
        }

        post "/api/v1/posts/#{post_record.id}/comments", params: comment_params, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end

  describe "DELETE /api/v1/posts/:post_id/comments/:id" do
    let(:comment) { create(:comment, post: post_record, user: user) }

    context "自分のコメントを削除する場合" do
      it "コメントを削除できる" do
        delete "/api/v1/posts/#{post_record.id}/comments/#{comment.id}", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "他人のコメントを削除しようとした場合" do
      it "403エラーを返す" do
        delete "/api/v1/posts/#{post_record.id}/comments/#{comment.id}", headers: auth_headers(other_user)

        expect(response).to have_http_status(:forbidden)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end
end
