class CreateJwtBlacklists < ActiveRecord::Migration[7.2]
  def change
    create_table :jwt_blacklists do |t|
      t.string :jti, null: false
      t.string :expires_at, null: false

      t.timestamps
    end

    # 高速検索
    add_index :jwt_blacklists, :jti, unique: true

    # 期限切れ削除
    add_index :jwt_blacklists, :expires_at
  end
end
