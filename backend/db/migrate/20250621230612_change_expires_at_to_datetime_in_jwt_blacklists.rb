class ChangeExpiresAtToDatetimeInJwtBlacklists < ActiveRecord::Migration[7.2]
  def up
    # テーブルが空であることを確認（SQLで直接実行）
    execute "DELETE FROM jwt_blacklists"

    # PostgreSQL用の型変換
    change_column :jwt_blacklists, :expires_at, 'timestamp USING expires_at::timestamp'
  end

  def down
    change_column :jwt_blacklists, :expires_at, :string
  end
end
