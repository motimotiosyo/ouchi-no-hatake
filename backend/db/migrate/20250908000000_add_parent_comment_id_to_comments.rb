class AddParentCommentIdToComments < ActiveRecord::Migration[7.2]
  def change
    add_reference :comments, :parent_comment, null: true, foreign_key: { to_table: :comments }, index: true
  end
end
