class CreateGuideSteps < ActiveRecord::Migration[7.2]
  def change
    create_table :guide_steps do |t|
      t.references :guide, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.integer :position
      t.integer :due_days

      t.timestamps
    end
  end
end
