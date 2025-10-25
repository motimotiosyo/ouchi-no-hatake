require 'rails_helper'

RSpec.describe GuideStep, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:position) }
    it { should validate_numericality_of(:position).only_integer.is_greater_than(0) }
    it { should validate_presence_of(:due_days) }
    it { should validate_numericality_of(:due_days).only_integer.is_greater_than_or_equal_to(0) }
  end

  describe 'アソシエーション' do
    it { should belong_to(:guide) }
  end
end
