require 'rails_helper'

RSpec.describe OauthService, type: :service do
  describe '.authenticate_google' do
    let(:valid_credential) { 'valid_google_credential' }
    let(:auth_info) do
      {
        provider: 'google',
        uid: '1234567890',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true
      }
    end

    before do
      # decode_google_tokenメソッドをスタブしてHTTP通信をモック
      allow(OauthService).to receive(:decode_google_token)
        .with(valid_credential)
        .and_return(auth_info)
    end

    context '新規ユーザーの場合' do
      it 'ユーザーが作成され、email_verifiedがtrueになる' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.to change(User, :count).by(1)

        user = User.last
        expect(user.email).to eq('test@example.com')
        expect(user.name).to eq('Test User')
        expect(user.email_verified).to be true
        expect(user.password_digest).to be_nil
      end

      it 'UserProviderが作成される' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.to change(UserProvider, :count).by(1)

        provider = UserProvider.last
        expect(provider.provider).to eq('google')
        expect(provider.uid).to eq('1234567890')
        expect(provider.email).to eq('test@example.com')
      end

      it 'JWTトークンが返される' do
        result = OauthService.authenticate_google(valid_credential)
        expect(result[:token]).to be_present
        expect(result[:user]).to be_a(User)
      end
    end

    context '既存ユーザー（email_verified: false）にOAuth連携を追加する場合' do
      let!(:existing_user) do
        create(:user, email: 'test@example.com', email_verified: false)
      end

      it 'ユーザーが新規作成されない' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.not_to change(User, :count)
      end

      it 'UserProviderが作成される' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.to change(UserProvider, :count).by(1)

        provider = UserProvider.last
        expect(provider.user_id).to eq(existing_user.id)
        expect(provider.provider).to eq('google')
        expect(provider.uid).to eq('1234567890')
      end

      it 'email_verifiedがtrueに更新される' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.to change { existing_user.reload.email_verified }.from(false).to(true)
      end

      it '既存ユーザーが返される' do
        result = OauthService.authenticate_google(valid_credential)
        expect(result[:user].id).to eq(existing_user.id)
      end
    end

    context '既存ユーザー（email_verified: true）にOAuth連携を追加する場合' do
      let!(:existing_user) do
        create(:user, :verified, email: 'test@example.com')
      end

      it 'email_verifiedはtrueのまま（無駄な更新なし）' do
        expect(existing_user.email_verified).to be true
        OauthService.authenticate_google(valid_credential)
        expect(existing_user.reload.email_verified).to be true
      end

      it 'UserProviderが作成される' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.to change(UserProvider, :count).by(1)
      end
    end

    context '既にOAuth連携済みのユーザーの場合' do
      let!(:existing_user) do
        create(:user, email: 'test@example.com', email_verified: true)
      end
      let!(:existing_provider) do
        create(:user_provider,
               user: existing_user,
               provider: 'google',
               uid: '1234567890',
               email: 'test@example.com')
      end

      it 'ユーザーもUserProviderも新規作成されない' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.not_to change(User, :count)

        expect {
          OauthService.authenticate_google(valid_credential)
        }.not_to change(UserProvider, :count)
      end

      it '既存ユーザーが返される' do
        result = OauthService.authenticate_google(valid_credential)
        expect(result[:user].id).to eq(existing_user.id)
      end
    end

    context 'Google Token検証が失敗した場合' do
      before do
        # decode_google_tokenがAuthenticationErrorを発生させるようにスタブ
        allow(OauthService).to receive(:decode_google_token)
          .with(valid_credential)
          .and_raise(OauthService::AuthenticationError, 'OAuth authentication failed: Invalid token')
      end

      it 'AuthenticationErrorが発生する' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.to raise_error(OauthService::AuthenticationError, /Invalid token/)
      end
    end

    context 'Client IDが一致しない場合' do
      before do
        # decode_google_tokenがAuthenticationErrorを発生させるようにスタブ
        allow(OauthService).to receive(:decode_google_token)
          .with(valid_credential)
          .and_raise(OauthService::AuthenticationError, 'OAuth authentication failed: Invalid client ID')
      end

      it 'AuthenticationErrorが発生する' do
        expect {
          OauthService.authenticate_google(valid_credential)
        }.to raise_error(OauthService::AuthenticationError, /Invalid client ID/)
      end
    end
  end
end
