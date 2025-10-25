require 'rails_helper'

RSpec.describe Question, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:text) }
  end

  describe 'アソシエーション' do
    it { should have_many(:choices).dependent(:destroy) }
  end
end
