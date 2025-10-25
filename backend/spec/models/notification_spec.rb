require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe 'バリデーション' do
    it { should validate_presence_of(:notification_type) }
    it { should validate_presence_of(:message) }
    it { should validate_inclusion_of(:read).in_array([true, false]) }
  end

  describe 'アソシエーション' do
    it { should belong_to(:user) }
    it { should belong_to(:actor).class_name('User') }
    it { should belong_to(:notifiable) }
  end

  describe 'enum' do
    it { should define_enum_for(:notification_type).with_values(like: 0, comment: 1, reply: 2, favorite: 3) }
  end

  describe 'スコープ' do
    let(:user) { create(:user) }
    let!(:unread_notification) { create(:notification, :unread, user: user) }
    let!(:read_notification) { create(:notification, :read, user: user) }

    describe '.unread' do
      it '未読通知のみ取得される' do
        expect(Notification.unread).to contain_exactly(unread_notification)
      end
    end

    describe '.recent' do
      it '作成日時の降順で取得される' do
        # order(created_at: :desc)が正しく動作することを確認
        notifications = Notification.recent.to_a
        expect(notifications).to eq(notifications.sort_by(&:created_at).reverse)
      end
    end
  end

  describe 'インスタンスメソッド' do
    let(:notification) { create(:notification, :unread) }

    describe '#mark_as_read!' do
      it '既読状態になる' do
        expect { notification.mark_as_read! }.to change { notification.read }.from(false).to(true)
      end
    end
  end

  describe 'polymorphic association' do
    let(:user) { create(:user) }
    let(:actor) { create(:user) }

    it 'Postに対して通知を作成できる' do
      post = create(:post, user: user)
      notification = create(:notification, :like_notification, user: user, actor: actor, notifiable: post)

      expect(notification.notifiable).to eq(post)
      expect(notification.notifiable_type).to eq('Post')
    end

    it 'Commentに対して通知を作成できる' do
      comment = create(:comment, user: user, post: create(:post, user: user))
      notification = create(:notification, :reply_notification, user: user, actor: actor, notifiable: comment)

      expect(notification.notifiable).to eq(comment)
      expect(notification.notifiable_type).to eq('Comment')
    end

    it 'GrowthRecordに対して通知を作成できる' do
      growth_record = create(:growth_record, :growing, user: user)
      notification = create(:notification, :favorite_notification, user: user, actor: actor, notifiable: growth_record)

      expect(notification.notifiable).to eq(growth_record)
      expect(notification.notifiable_type).to eq('GrowthRecord')
    end
  end
end
