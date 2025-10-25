require 'rails_helper'

RSpec.describe Like, type: :model do
  describe 'バリデーション' do
    let(:user) { create(:user) }
    let(:post_record) { create(:post, user: user) }

    it '同じユーザーが同じ投稿に複数回いいねできない' do
      create(:like, user: user, post: post_record)
      duplicate_like = build(:like, user: user, post: post_record)

      expect(duplicate_like).not_to be_valid
      expect(duplicate_like.errors[:user_id]).to include("既にいいね済みです")
    end

    it '異なる投稿には同じユーザーがいいねできる' do
      create(:like, user: user, post: post_record)
      another_post = create(:post, user: user)
      another_like = build(:like, user: user, post: another_post)

      expect(another_like).to be_valid
    end

    it '異なるユーザーは同じ投稿にいいねできる' do
      create(:like, user: user, post: post_record)
      another_user = create(:user)
      another_like = build(:like, user: another_user, post: post_record)

      expect(another_like).to be_valid
    end
  end

  describe 'アソシエーション' do
    it { should belong_to(:user) }
    it { should belong_to(:post) }
  end
end
