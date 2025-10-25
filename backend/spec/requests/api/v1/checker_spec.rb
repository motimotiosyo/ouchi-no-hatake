require 'rails_helper'

RSpec.describe "Api::V1::Checker", type: :request do
  let!(:question) { create(:question) }
  let!(:choices) { create_list(:choice, 3, question: question) }
  let(:plant) { create(:plant) }

  before do
    choices.each do |choice|
      create(:choice_score, choice: choice, plant: plant, score: 10)
    end
  end

  describe "GET /api/v1/checker/questions" do
    it "質問一覧を取得できる" do
      get "/api/v1/checker/questions"

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end

  describe "POST /api/v1/checker/diagnose" do
    it "診断を実行できる" do
      post "/api/v1/checker/diagnose", params: { choice_ids: [choices.first.id] }

      expect(response).to have_http_status(:ok)
      json = json_response
      expect(json[:success]).to be true
    end
  end
end
