require 'rails_helper'

RSpec.describe "Api::V1::Posts", type: :request do
  let(:user) { create(:user, :verified) }
  let(:other_user) { create(:user, :verified) }
  let(:category) { create(:category) }

  describe "GET /api/v1/posts" do
    let!(:posts) { create_list(:post, 3, user: user, category: category) }

    context "未認証の場合" do
      it "投稿一覧を取得できる" do
        get "/api/v1/posts"

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:posts].size).to eq(3)
      end
    end

    context "認証済みの場合" do
      it "投稿一覧を取得できる" do
        get "/api/v1/posts", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:posts].size).to eq(3)
      end
    end

    context "ページネーション指定の場合" do
      it "指定した件数で取得できる" do
        get "/api/v1/posts", params: { page: 1, per_page: 2 }

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:data][:posts].size).to eq(2)
        expect(json[:data][:pagination][:total_count]).to eq(3)
      end
    end
  end

  describe "GET /api/v1/posts/:id" do
    let(:post) { create(:post, user: user, category: category) }

    context "未認証の場合" do
      it "投稿詳細を取得できる" do
        get "/api/v1/posts/#{post.id}"

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:id]).to eq(post.id)
      end
    end

    context "存在しない投稿の場合" do
      it "404エラーを返す" do
        get "/api/v1/posts/99999"

        expect(response).to have_http_status(:not_found)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end

  describe "POST /api/v1/posts" do
    context "正しいパラメータの場合" do
      it "投稿を作成できる" do
        post_params = {
          post: {
            title: "テスト投稿",
            content: "テスト内容",
            category_id: category.id,
            post_type: "general_post"
          }
        }

        post "/api/v1/posts", params: post_params, headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:title]).to eq("テスト投稿")
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        post_params = {
          post: {
            title: "テスト投稿",
            content: "テスト内容",
            category_id: category.id,
            post_type: "general_post"
          }
        }

        post "/api/v1/posts", params: post_params

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "不正なパラメータの場合" do
      it "422エラーを返す" do
        post_params = {
          post: {
            title: "テスト投稿",
            content: "",
            category_id: category.id,
            post_type: "general_post"
          }
        }

        post "/api/v1/posts", params: post_params, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end

  describe "PUT /api/v1/posts/:id" do
    let(:post) { create(:post, user: user, category: category) }

    context "正しいパラメータの場合" do
      it "投稿を更新できる" do
        put_params = {
          post: {
            title: "更新後タイトル",
            content: "更新後内容"
          }
        }

        put "/api/v1/posts/#{post.id}", params: put_params, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:title]).to eq("更新後タイトル")
      end
    end

    context "他人の投稿を更新しようとした場合" do
      it "404エラーを返す" do
        put_params = {
          post: {
            title: "更新後タイトル"
          }
        }

        put "/api/v1/posts/#{post.id}", params: put_params, headers: auth_headers(other_user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/posts/:id" do
    let(:post) { create(:post, user: user, category: category) }

    context "自分の投稿を削除する場合" do
      it "投稿を削除できる" do
        delete "/api/v1/posts/#{post.id}", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "他人の投稿を削除しようとした場合" do
      it "404エラーを返す" do
        delete "/api/v1/posts/#{post.id}", headers: auth_headers(other_user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
