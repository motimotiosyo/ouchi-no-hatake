require 'rails_helper'

RSpec.describe Follow, type: :model do
  describe 'バリデーション' do
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }

    it '同じユーザーが同じユーザーを複数回フォローできない' do
      create(:follow, follower: user1, followee: user2)
      duplicate_follow = build(:follow, follower: user1, followee: user2)

      expect(duplicate_follow).not_to be_valid
      expect(duplicate_follow.errors[:follower_id]).to include("既にフォロー済みです")
    end

    it '異なるユーザーには同じユーザーがフォローできる' do
      user3 = create(:user)
      create(:follow, follower: user1, followee: user2)
      another_follow = build(:follow, follower: user1, followee: user3)

      expect(another_follow).to be_valid
    end

    it '異なるユーザーは同じユーザーをフォローできる' do
      user3 = create(:user)
      create(:follow, follower: user1, followee: user2)
      another_follow = build(:follow, follower: user3, followee: user2)

      expect(another_follow).to be_valid
    end

    it '自分自身をフォローできない' do
      self_follow = build(:follow, follower: user1, followee: user1)

      expect(self_follow).not_to be_valid
      expect(self_follow.errors[:base]).to include("自分自身をフォローすることはできません")
    end
  end

  describe 'アソシエーション' do
    it { should belong_to(:follower).class_name('User') }
    it { should belong_to(:followee).class_name('User') }
  end
end
