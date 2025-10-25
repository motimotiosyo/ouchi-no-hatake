require 'rails_helper'

RSpec.describe GrowthRecordStep, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:growth_record_id) }
    it { should validate_presence_of(:guide_step_id) }
  end

  describe 'アソシエーション' do
    it { should belong_to(:growth_record) }
    it { should belong_to(:guide_step) }
  end

  describe 'スコープ' do
    let(:user) { create(:user) }
    let(:growth_record) { create(:growth_record, :growing, user: user) }
    let!(:completed_step) { create(:growth_record_step, :completed, growth_record: growth_record) }
    let!(:incomplete_step) { create(:growth_record_step, growth_record: growth_record) }

    describe '.completed' do
      it '完了ステップのみ取得される' do
        expect(GrowthRecordStep.completed).to contain_exactly(completed_step)
      end
    end

    describe '.incomplete' do
      it '未完了ステップのみ取得される' do
        expect(GrowthRecordStep.incomplete).to contain_exactly(incomplete_step)
      end
    end
  end
end
