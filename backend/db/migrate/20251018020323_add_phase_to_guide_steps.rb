class AddPhaseToGuideSteps < ActiveRecord::Migration[7.2]
  def change
    add_column :guide_steps, :phase, :integer, null: false, default: 0
    add_column :guide_steps, :applicable_to, :string, null: false, default: 'all'

    add_index :guide_steps, [:guide_id, :phase]
  end
end
