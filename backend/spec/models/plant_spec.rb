require 'rails_helper'

RSpec.describe Plant, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:name) }
  end

  describe 'アソシエーション' do
    it { should have_many(:growth_records).dependent(:destroy) }
    it { should have_many(:choice_scores).dependent(:destroy) }
    it { should have_many(:choices).through(:choice_scores) }
    it { should have_one(:guide).dependent(:destroy) }
  end
end
