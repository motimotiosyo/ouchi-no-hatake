require "test_helper"
require "rake"

class CleanupRakeTest < ActiveSupport::TestCase
  def setup
    # rakeタスクをロード
    Rails.application.load_tasks
    # テスト前に関連データをクリア（外部キー制約を考慮した順序）
    Like.delete_all
    User.delete_all
  end

  def teardown
    Rake::Task["cleanup:unverified_users"].reenable if Rake::Task.task_defined?("cleanup:unverified_users")
  end

  test "cleanup:unverified_users deletes expired unverified users" do
    # 期限切れ未認証ユーザーを作成（25時間前）
    expired_user = User.create!(
      name: "Expired User",
      email: "expired@example.com",
      password: "password123",
      email_verified: false,
      email_verification_sent_at: 25.hours.ago
    )

    # 期限内未認証ユーザーを作成（1時間前）
    recent_user = User.create!(
      name: "Recent User",
      email: "recent@example.com",
      password: "password123",
      email_verified: false,
      email_verification_sent_at: 1.hour.ago
    )

    # 認証済みユーザーを作成（25時間前でも削除されない）
    verified_user = User.create!(
      name: "Verified User",
      email: "verified@example.com",
      password: "password123",
      email_verified: true,
      email_verification_sent_at: 25.hours.ago
    )

    assert_equal 3, User.count

    # Rakeタスク実行
    capture_io do
      Rake::Task["cleanup:unverified_users"].invoke
    end

    # 結果確認
    assert_equal 2, User.count
    assert_not User.exists?(expired_user.id)
    assert User.exists?(recent_user.id)
    assert User.exists?(verified_user.id)
  end

  test "cleanup:unverified_users handles no expired users gracefully" do
    # 期限内未認証ユーザーのみを作成
    User.create!(
      name: "Recent User",
      email: "recent@example.com",
      password: "password123",
      email_verified: false,
      email_verification_sent_at: 1.hour.ago
    )

    # 認証済みユーザーを作成
    User.create!(
      name: "Verified User",
      email: "verified@example.com",
      password: "password123",
      email_verified: true
    )

    assert_equal 2, User.count

    # Rakeタスク実行
    capture_io do
      Rake::Task["cleanup:unverified_users"].invoke
    end

    # 削除されないことを確認
    assert_equal 2, User.count
  end

  test "cleanup:unverified_users logs deletion details" do
    # 期限切れ未認証ユーザーを作成
    expired_user1 = User.create!(
      name: "Expired User 1",
      email: "expired1@example.com",
      password: "password123",
      email_verified: false,
      email_verification_sent_at: 25.hours.ago
    )

    expired_user2 = User.create!(
      name: "Expired User 2",
      email: "expired2@example.com",
      password: "password123",
      email_verified: false,
      email_verification_sent_at: 30.hours.ago
    )

    assert_equal 2, User.count

    # ログをキャプチャ
    output, _error = capture_io do
      Rake::Task["cleanup:unverified_users"].invoke
    end

    # 結果確認
    assert_equal 0, User.count
    assert_includes output, "2 expired unverified users deleted"
  end
end
