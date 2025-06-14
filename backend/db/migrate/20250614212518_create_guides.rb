class CreateGuides < ActiveRecord::Migration[7.2]
  def change
    create_table :guides do |t|
      t.references :plant, null: false, foreign_key: true

      t.timestamps
    end
  end
end
