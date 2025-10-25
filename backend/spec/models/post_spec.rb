require 'rails_helper'

RSpec.describe Post, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:content) }
    it { should validate_presence_of(:post_type) }
  end

  describe 'アソシエーション' do
    it { should belong_to(:user) }
    it { should belong_to(:growth_record).optional }
    it { should belong_to(:category).optional }
    it { should have_many(:likes).dependent(:destroy) }
    it { should have_many(:comments).dependent(:destroy) }
    it { should have_many_attached(:images) }
  end

  describe 'enum' do
    it { should define_enum_for(:post_type).with_values(growth_record_post: 0, general_post: 1) }
  end

  describe 'スコープ' do
    let!(:user) { create(:user) }
    let!(:category) { create(:category) }
    let!(:growth_record) { create(:growth_record, user: user) }
    let!(:general_post) { create(:post, user: user, category: category, post_type: :general_post, created_at: 2.days.ago) }
    let!(:growth_post) { create(:post, user: user, growth_record: growth_record, post_type: :growth_record_post, created_at: 1.day.ago) }

    describe '.timeline' do
      it '作成日時の降順で取得される' do
        posts = Post.timeline
        expect(posts.first).to eq(growth_post)
        expect(posts.second).to eq(general_post)
      end

      it 'user, category, growth_recordが事前ロードされる' do
        posts = Post.timeline
        expect(posts.first.association(:user).loaded?).to be true
        expect(posts.first.association(:category).loaded?).to be true
        expect(posts.first.association(:growth_record).loaded?).to be true
      end
    end

    describe '.growth_record_posts' do
      it '成長記録投稿のみ取得される' do
        posts = Post.growth_record_posts
        expect(posts).to contain_exactly(growth_post)
      end
    end

    describe '.general_posts' do
      it '一般投稿のみ取得される' do
        posts = Post.general_posts
        expect(posts).to contain_exactly(general_post)
      end
    end
  end

  describe 'インスタンスメソッド' do
    let(:user) { create(:user) }
    let(:post) { create(:post, user: user) }

    describe '#likes_count' do
      it 'いいね数を返す' do
        create_list(:like, 3, post: post)
        expect(post.likes_count).to eq(3)
      end
    end

    describe '#liked_by?' do
      let(:other_user) { create(:user) }

      it 'いいねしていない場合falseを返す' do
        expect(post.liked_by?(other_user)).to be false
      end

      it 'いいねしている場合trueを返す' do
        create(:like, user: other_user, post: post)
        expect(post.liked_by?(other_user)).to be true
      end

      it 'nilが渡された場合falseを返す' do
        expect(post.liked_by?(nil)).to be false
      end
    end

    describe '#comments_count' do
      it 'コメント数を返す' do
        create_list(:comment, 2, post: post, user: user)
        expect(post.comments_count).to eq(2)
      end
    end
  end
end
