require 'rails_helper'

RSpec.describe Choice, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:text) }
    it { should validate_presence_of(:question_id) }
  end

  describe 'アソシエーション' do
    it { should belong_to(:question) }
    it { should have_many(:choice_scores).dependent(:destroy) }
    it { should have_many(:plants).through(:choice_scores) }
  end
end
