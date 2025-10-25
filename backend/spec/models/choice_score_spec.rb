require 'rails_helper'

RSpec.describe ChoiceScore, type: :model do
  let(:choice) { create(:choice) }
  let(:plant) { create(:plant) }

  describe 'バリデーション' do
    it { should validate_presence_of(:score) }
    it { should validate_numericality_of(:score).only_integer }
    it { should validate_presence_of(:choice_id) }
    it { should validate_presence_of(:plant_id) }

    it '同じ選択肢と植物の組み合わせは一意である' do
      create(:choice_score, choice: choice, plant: plant)
      duplicate_score = build(:choice_score, choice: choice, plant: plant)

      expect(duplicate_score).not_to be_valid
      expect(duplicate_score.errors[:choice_id]).to include("この選択肢と植物の組み合わせは既に存在します")
    end

    it '異なる選択肢なら同じ植物で登録できる' do
      choice2 = create(:choice)
      create(:choice_score, choice: choice, plant: plant)
      score2 = build(:choice_score, choice: choice2, plant: plant)

      expect(score2).to be_valid
    end

    it '異なる植物なら同じ選択肢で登録できる' do
      plant2 = create(:plant)
      create(:choice_score, choice: choice, plant: plant)
      score2 = build(:choice_score, choice: choice, plant: plant2)

      expect(score2).to be_valid
    end
  end

  describe 'アソシエーション' do
    it { should belong_to(:choice) }
    it { should belong_to(:plant) }
  end
end
