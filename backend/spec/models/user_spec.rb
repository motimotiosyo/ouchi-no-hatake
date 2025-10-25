require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーション' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:name) }
    it { should validate_uniqueness_of(:email) }
    it { should allow_value('user@example.com').for(:email) }
    it { should_not allow_value('invalid_email').for(:email) }
    it { should validate_length_of(:password).is_at_least(6).on(:create) }
  end

  describe 'アソシエーション' do
    it { should have_many(:posts).dependent(:destroy) }
    it { should have_many(:growth_records).dependent(:destroy) }
    it { should have_many(:likes).dependent(:destroy) }
    it { should have_many(:liked_posts).through(:likes) }
    it { should have_many(:comments).dependent(:destroy) }
    it { should have_many(:favorite_growth_records).dependent(:destroy) }
    it { should have_many(:favorited_growth_records).through(:favorite_growth_records) }
    it { should have_many(:notifications).dependent(:destroy) }
    it { should have_many(:active_follows).dependent(:destroy) }
    it { should have_many(:passive_follows).dependent(:destroy) }
    it { should have_many(:following).through(:active_follows) }
    it { should have_many(:followers).through(:passive_follows) }
    it { should have_one_attached(:avatar) }
  end

  describe 'メール認証' do
    let(:user) { create(:user) }

    describe '#generate_email_verification_token!' do
      it 'メール認証トークンが生成される' do
        expect { user.generate_email_verification_token! }.to change { user.email_verification_token }.from(nil)
      end

      it 'メール認証送信日時が記録される' do
        expect { user.generate_email_verification_token! }.to change { user.email_verification_sent_at }.from(nil)
      end
    end

    describe '#email_verified?' do
      it 'メール認証済みの場合trueを返す' do
        user.update(email_verified: true)
        expect(user.email_verified?).to be true
      end

      it 'メール未認証の場合falseを返す' do
        expect(user.email_verified?).to be false
      end
    end

    describe '#verify_email!' do
      before do
        user.generate_email_verification_token!
      end

      it 'email_verifiedがtrueになる' do
        expect { user.verify_email! }.to change { user.email_verified }.from(false).to(true)
      end

      it 'email_verification_tokenがnilになる' do
        expect { user.verify_email! }.to change { user.email_verification_token }.to(nil)
      end
    end

    describe '#verification_expired?' do
      it '24時間以内の場合falseを返す' do
        user.update(email_verification_sent_at: 23.hours.ago)
        expect(user.verification_expired?).to be false
      end

      it '24時間を超えた場合trueを返す' do
        user.update(email_verification_sent_at: 25.hours.ago)
        expect(user.verification_expired?).to be true
      end

      it 'email_verification_sent_atがnilの場合falseを返す' do
        user.update(email_verification_sent_at: nil)
        expect(user.verification_expired?).to be_falsy
      end
    end
  end

  describe 'フォロー機能' do
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }

    describe '#following?' do
      it 'フォローしていない場合falseを返す' do
        expect(user1.following?(user2)).to be false
      end

      it 'フォローしている場合trueを返す' do
        user1.following << user2
        expect(user1.following?(user2)).to be true
      end

      it 'nilが渡された場合falseを返す' do
        expect(user1.following?(nil)).to be false
      end
    end

    describe '#followed_by?' do
      it 'フォローされていない場合falseを返す' do
        expect(user1.followed_by?(user2)).to be false
      end

      it 'フォローされている場合trueを返す' do
        user2.following << user1
        expect(user1.followed_by?(user2)).to be true
      end

      it 'nilが渡された場合falseを返す' do
        expect(user1.followed_by?(nil)).to be false
      end
    end

    describe '#following_count' do
      it 'フォロー数を返す' do
        user1.following << user2
        expect(user1.following_count).to eq(1)
      end
    end

    describe '#followers_count' do
      it 'フォロワー数を返す' do
        user2.following << user1
        expect(user1.followers_count).to eq(1)
      end
    end
  end

  describe 'スコープ' do
    describe '.unverified_expired' do
      let!(:verified_user) { create(:user, :verified) }
      let!(:unverified_recent) { create(:user, :unverified_with_token) }
      let!(:unverified_expired) { create(:user, :unverified_expired) }

      it '期限切れ未認証ユーザーのみ取得する' do
        expect(User.unverified_expired).to contain_exactly(unverified_expired)
      end
    end
  end

  describe 'コールバック' do
    describe 'before_save :downcase_email' do
      it 'メールアドレスが小文字に変換される' do
        user = create(:user, email: 'TEST@EXAMPLE.COM')
        expect(user.reload.email).to eq('test@example.com')
      end
    end
  end
end
