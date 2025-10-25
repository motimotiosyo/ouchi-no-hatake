require 'rails_helper'

RSpec.describe GrowthRecord, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:record_number) }

    context 'planningステータスの場合' do
      subject { build(:growth_record, status: :planning) }

      it 'started_onは必須ではない' do
        subject.started_on = nil
        expect(subject).to be_valid
      end
    end

    context 'planning以外のステータスの場合' do
      subject { build(:growth_record, status: :growing, started_on: nil) }

      it 'started_onが必須' do
        expect(subject).not_to be_valid
        expect(subject.errors[:started_on]).to include("を入力してください")
      end
    end
  end

  describe 'アソシエーション' do
    it { should belong_to(:user) }
    it { should belong_to(:plant) }
    it { should belong_to(:guide).optional }
    it { should have_many(:posts).dependent(:destroy) }
    it { should have_many(:favorite_growth_records).dependent(:destroy) }
    it { should have_many(:growth_record_steps).dependent(:destroy) }
    it { should have_one_attached(:thumbnail) }
  end

  describe 'enum' do
    it { should define_enum_for(:status).with_values(planning: 0, growing: 1, completed: 2, failed: 3) }
    it { should define_enum_for(:planting_method).with_values(seed: 0, seedling: 1) }
  end

  describe 'インスタンスメソッド' do
    let(:user) { create(:user) }
    let(:growth_record) { create(:growth_record, :growing, user: user) }

    describe '#favorites_count' do
      it 'お気に入り数を返す' do
        create_list(:favorite_growth_record, 2, growth_record: growth_record)
        expect(growth_record.favorites_count).to eq(2)
      end
    end

    describe '#favorited_by?' do
      let(:other_user) { create(:user) }

      it 'お気に入り登録していない場合falseを返す' do
        expect(growth_record.favorited_by?(other_user)).to be false
      end

      it 'お気に入り登録している場合trueを返す' do
        create(:favorite_growth_record, user: other_user, growth_record: growth_record)
        expect(growth_record.favorited_by?(other_user)).to be true
      end

      it 'nilが渡された場合falseを返す' do
        expect(growth_record.favorited_by?(nil)).to be false
      end
    end
  end
end
