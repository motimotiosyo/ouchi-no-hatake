require 'rails_helper'

RSpec.describe Comment, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:content) }
    it { should validate_length_of(:content).is_at_most(255) }
  end

  describe 'アソシエーション' do
    it { should belong_to(:user) }
    it { should belong_to(:post) }
    it { should belong_to(:parent_comment).optional }
    it { should have_many(:replies).dependent(:destroy) }
  end

  describe 'スコープ' do
    let(:user) { create(:user) }
    let(:post_record) { create(:post, user: user) }
    let!(:top_comment) { create(:comment, post: post_record, user: user) }
    let!(:reply_comment) { create(:comment, :reply, post: post_record, user: user, parent_comment: top_comment) }

    describe '.top_level' do
      it 'トップレベルコメントのみ取得される' do
        expect(Comment.top_level).to contain_exactly(top_comment)
      end
    end
  end

  describe 'インスタンスメソッド' do
    let(:user) { create(:user) }
    let(:post_record) { create(:post, user: user) }

    describe '#reply?' do
      it 'トップレベルコメントの場合falseを返す' do
        comment = create(:comment, post: post_record, user: user)
        expect(comment.reply?).to be false
      end

      it 'リプライコメントの場合trueを返す' do
        parent = create(:comment, post: post_record, user: user)
        reply = create(:comment, post: post_record, user: user, parent_comment: parent)
        expect(reply.reply?).to be true
      end
    end

    describe '#replies_count' do
      it 'リプライ数を返す' do
        comment = create(:comment, post: post_record, user: user)
        create_list(:comment, 3, post: post_record, user: user, parent_comment: comment)
        expect(comment.replies_count).to eq(3)
      end
    end
  end
end
