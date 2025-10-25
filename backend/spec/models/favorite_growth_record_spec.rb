require 'rails_helper'

RSpec.describe FavoriteGrowthRecord, type: :model do
  describe 'バリデーション' do
    let(:user) { create(:user) }
    let(:growth_record) { create(:growth_record, :growing, user: user) }

    it '同じユーザーが同じ成長記録に複数回お気に入り登録できない' do
      create(:favorite_growth_record, user: user, growth_record: growth_record)
      duplicate_favorite = build(:favorite_growth_record, user: user, growth_record: growth_record)

      expect(duplicate_favorite).not_to be_valid
      expect(duplicate_favorite.errors[:user_id]).to include("既にお気に入り済みです")
    end

    it '異なる成長記録には同じユーザーがお気に入り登録できる' do
      create(:favorite_growth_record, user: user, growth_record: growth_record)
      another_record = create(:growth_record, :growing, user: user)
      another_favorite = build(:favorite_growth_record, user: user, growth_record: another_record)

      expect(another_favorite).to be_valid
    end

    it '異なるユーザーは同じ成長記録にお気に入り登録できる' do
      create(:favorite_growth_record, user: user, growth_record: growth_record)
      another_user = create(:user)
      another_favorite = build(:favorite_growth_record, user: another_user, growth_record: growth_record)

      expect(another_favorite).to be_valid
    end
  end

  describe 'アソシエーション' do
    it { should belong_to(:user) }
    it { should belong_to(:growth_record) }
  end
end
