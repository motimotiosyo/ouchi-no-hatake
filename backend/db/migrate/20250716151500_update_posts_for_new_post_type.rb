class UpdatePostsForNewPostType < ActiveRecord::Migration[7.2]
  def up
    # destination_typeカラムをpost_typeに変更
    rename_column :posts, :destination_type, :post_type
    
    # 既存データを新しいenumに変換
    # public_post(0) -> growth_record_post(0)
    # friends_only(1) -> general_post(1) 
    # private_post(2) -> general_post(1)
    execute <<-SQL
      UPDATE posts 
      SET post_type = CASE 
        WHEN post_type = 0 THEN 0
        WHEN post_type = 1 THEN 1
        WHEN post_type = 2 THEN 1
        ELSE 0
      END
    SQL
    
    # growth_record_idをnull許可に変更
    change_column_null :posts, :growth_record_id, true
  end

  def down
    # 元に戻す処理
    change_column_null :posts, :growth_record_id, false
    
    # データを元のenumに戻す（簡易的に全てpublic_postに）
    execute "UPDATE posts SET post_type = 0"
    
    rename_column :posts, :post_type, :destination_type
  end
end