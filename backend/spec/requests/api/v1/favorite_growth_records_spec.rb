require 'rails_helper'

RSpec.describe "Api::V1::FavoriteGrowthRecords", type: :request do
  let(:user) { create(:user, :verified) }
  let(:other_user) { create(:user, :verified) }
  let(:plant) { create(:plant) }
  let(:guide) { create(:guide, plant: plant) }
  let(:growth_record) { create(:growth_record, user: other_user, plant: plant, guide: guide) }

  describe "POST /api/v1/growth_records/:growth_record_id/favorite" do
    context "正しいパラメータの場合" do
      it "お気に入りを作成できる" do
        post "/api/v1/growth_records/#{growth_record.id}/favorite", headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        post "/api/v1/growth_records/#{growth_record.id}/favorite"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "DELETE /api/v1/growth_records/:growth_record_id/favorite" do
    before do
      create(:favorite_growth_record, growth_record: growth_record, user: user)
    end

    context "認証済みの場合" do
      it "お気に入りを削除できる" do
        delete "/api/v1/growth_records/#{growth_record.id}/favorite", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        delete "/api/v1/growth_records/#{growth_record.id}/favorite"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
