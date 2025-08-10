require "test_helper"
require "rake"

class CleanupRakeTest < ActiveSupport::TestCase
  def setup
    Rake.application.rake_require "tasks/cleanup"
    Rake::Task.define_task(:environment)
    # テスト前にユーザーデータをクリア
    User.delete_all
  end

  def teardown
    Rake::Task["cleanup:unverified_users"].reenable
  end

  test "cleanup:unverified_users deletes expired unverified users" do
    # 期限切れ未認証ユーザーを作成（25時間前）
    expired_user = User.create!(
      name: "Expired User",
      email: "expired@example.com",
      password: "password123",
      email_verified: false,
      email_verification_token: "expired_token",
      email_verification_sent_at: 25.hours.ago
    )

    # 期限内未認証ユーザーを作成（12時間前）
    recent_user = User.create!(
      name: "Recent User",
      email: "recent@example.com",
      password: "password123",
      email_verified: false,
      email_verification_token: "recent_token",
      email_verification_sent_at: 12.hours.ago
    )

    # 認証済みユーザーを作成（期限切れだが認証済み）
    verified_user = User.create!(
      name: "Verified User",
      email: "verified@example.com",
      password: "password123",
      email_verified: true,
      email_verification_token: nil,
      email_verification_sent_at: 30.hours.ago
    )

    # 初期状態の確認
    assert_equal 3, User.count
    assert_equal 2, User.where(email_verified: false).count

    # タスク実行
    capture_io do
      Rake::Task["cleanup:unverified_users"].invoke
    end

    # 結果の確認
    assert_equal 2, User.count, "期限切れ未認証ユーザーのみが削除されるべき"
    assert_not User.exists?(expired_user.id), "期限切れ未認証ユーザーが削除されていない"
    assert User.exists?(recent_user.id), "期限内未認証ユーザーが誤って削除された"
    assert User.exists?(verified_user.id), "認証済みユーザーが誤って削除された"
  end

  test "cleanup:unverified_users handles no expired users gracefully" do
    # 期限内未認証ユーザーのみ作成
    User.create!(
      name: "Recent User",
      email: "recent@example.com",
      password: "password123",
      email_verified: false,
      email_verification_token: "recent_token",
      email_verification_sent_at: 12.hours.ago
    )

    # 認証済みユーザーを作成
    User.create!(
      name: "Verified User",
      email: "verified@example.com",
      password: "password123",
      email_verified: true,
      email_verification_token: nil
    )

    # 初期状態の確認
    initial_count = User.count

    # タスク実行
    output = capture_io do
      Rake::Task["cleanup:unverified_users"].invoke
    end

    # 結果の確認
    assert_equal initial_count, User.count, "ユーザーが削除されるべきでない"
    assert_match(/No expired unverified users to delete/, output.join)
  end

  test "cleanup:unverified_users logs deletion details" do
    # 期限切れ未認証ユーザーを複数作成
    user1 = User.create!(
      name: "User 1",
      email: "user1@example.com",
      password: "password123",
      email_verified: false,
      email_verification_token: "token1",
      email_verification_sent_at: 25.hours.ago
    )

    user2 = User.create!(
      name: "User 2",
      email: "user2@example.com",
      password: "password123",
      email_verified: false,
      email_verification_token: "token2",
      email_verification_sent_at: 30.hours.ago
    )

    # タスク実行
    capture_io do
      Rake::Task["cleanup:unverified_users"].invoke
    end

    # 削除の確認
    assert_not User.exists?(user1.id), "User 1 should be deleted"
    assert_not User.exists?(user2.id), "User 2 should be deleted"
  end
end
