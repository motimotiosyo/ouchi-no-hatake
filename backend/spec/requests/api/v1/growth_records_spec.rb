require 'rails_helper'

RSpec.describe "Api::V1::GrowthRecords", type: :request do
  let(:user) { create(:user, :verified) }
  let(:other_user) { create(:user, :verified) }
  let(:plant) { create(:plant) }
  let(:guide) { create(:guide, plant: plant) }

  describe "GET /api/v1/growth_records" do
    let!(:growth_records) { create_list(:growth_record, 3, user: user, plant: plant, guide: guide) }

    context "認証済みの場合" do
      it "自分の成長記録一覧を取得できる" do
        get "/api/v1/growth_records", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:growth_records].size).to eq(3)
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        get "/api/v1/growth_records"

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /api/v1/growth_records/:id" do
    let(:growth_record) { create(:growth_record, user: user, plant: plant, guide: guide) }

    context "未認証の場合" do
      it "成長記録詳細を取得できる" do
        get "/api/v1/growth_records/#{growth_record.id}"

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:growth_record][:id]).to eq(growth_record.id)
      end
    end

    context "存在しない成長記録の場合" do
      it "404エラーを返す" do
        get "/api/v1/growth_records/99999"

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/growth_records" do
    context "正しいパラメータの場合" do
      it "成長記録を作成できる" do
        growth_record_params = {
          growth_record: {
            plant_id: plant.id,
            guide_id: guide.id,
            record_name: "テスト成長記録",
            location: "ベランダ",
            started_on: Date.today,
            status: "growing"
          }
        }

        post "/api/v1/growth_records", params: growth_record_params, headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:record_name]).to eq("テスト成長記録")
      end
    end

    context "未認証の場合" do
      it "422エラーを返す" do
        growth_record_params = {
          growth_record: {
            plant_id: plant.id,
            guide_id: guide.id,
            record_name: "テスト成長記録",
            status: "growing"
          }
        }

        post "/api/v1/growth_records", params: growth_record_params

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "不正なパラメータの場合" do
      it "422エラーを返す" do
        growth_record_params = {
          growth_record: {
            plant_id: nil,
            guide_id: guide.id,
            record_name: "テスト成長記録",
            status: "growing"
          }
        }

        post "/api/v1/growth_records", params: growth_record_params, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json = json_response
        expect(json[:success]).to be false
      end
    end
  end

  describe "PUT /api/v1/growth_records/:id" do
    let(:growth_record) { create(:growth_record, user: user, plant: plant, guide: guide) }

    context "正しいパラメータの場合" do
      it "成長記録を更新できる" do
        put_params = {
          growth_record: {
            record_name: "更新後の名前",
            location: "庭"
          }
        }

        put "/api/v1/growth_records/#{growth_record.id}", params: put_params, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
        expect(json[:data][:record_name]).to eq("更新後の名前")
      end
    end

    context "他人の成長記録を更新しようとした場合" do
      it "404エラーを返す" do
        put_params = {
          growth_record: {
            record_name: "更新後の名前"
          }
        }

        put "/api/v1/growth_records/#{growth_record.id}", params: put_params, headers: auth_headers(other_user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/growth_records/:id" do
    let(:growth_record) { create(:growth_record, user: user, plant: plant, guide: guide) }

    context "自分の成長記録を削除する場合" do
      it "成長記録を削除できる" do
        delete "/api/v1/growth_records/#{growth_record.id}", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json[:success]).to be true
      end
    end

    context "他人の成長記録を削除しようとした場合" do
      it "404エラーを返す" do
        delete "/api/v1/growth_records/#{growth_record.id}", headers: auth_headers(other_user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
