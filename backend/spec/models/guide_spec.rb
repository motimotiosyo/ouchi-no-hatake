require 'rails_helper'

RSpec.describe Guide, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:plant_id) }
  end

  describe 'アソシエーション' do
    it { should belong_to(:plant) }
    it { should have_many(:guide_steps).dependent(:destroy) }
    it { should have_many(:growth_records).dependent(:nullify) }
  end

  describe 'guide_stepsの順序' do
    it 'positionの順序でguide_stepsを取得する' do
      guide = create(:guide)
      step3 = create(:guide_step, guide: guide, position: 3)
      step1 = create(:guide_step, guide: guide, position: 1)
      step2 = create(:guide_step, guide: guide, position: 2)

      expect(guide.guide_steps).to eq([step1, step2, step3])
    end
  end
end
