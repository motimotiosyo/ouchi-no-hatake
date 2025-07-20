class AddDefaultToPostTitle < ActiveRecord::Migration[7.2]
  def change
    change_column_default :posts, :title, ''
  end
end
