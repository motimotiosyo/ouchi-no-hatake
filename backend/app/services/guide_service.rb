class GuideService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  # ガイド一覧の取得とレスポンス構築
  def self.fetch_guides
    guides = Guide.includes(:plant, :guide_steps).order("plants.name")

    guides_data = guides.map { |guide| build_guide_list_response(guide) }

    ApplicationSerializer.success(data: { guides: guides_data })
  end

  # ガイド詳細の取得とレスポンス構築
  def self.fetch_guide_detail(guide_id)
    guide = Guide.includes(:plant, guide_steps: []).find(guide_id)

    guide_data = build_guide_detail_response(guide)

    ApplicationSerializer.success(data: guide_data)
  rescue ActiveRecord::RecordNotFound
    raise ValidationError.new("ガイドが見つかりません")
  end

  private

  # ガイド一覧レスポンスの構築
  def self.build_guide_list_response(guide)
    {
      id: guide.id,
      plant: {
        id: guide.plant.id,
        name: guide.plant.name,
        description: guide.plant.description
      },
      steps_count: guide.guide_steps.size
    }
  end

  # ガイド詳細レスポンスの構築
  def self.build_guide_detail_response(guide)
    {
      id: guide.id,
      plant: {
        id: guide.plant.id,
        name: guide.plant.name,
        description: guide.plant.description
      },
      calendar: {
        planting_months: guide.planting_months,
        transplanting_months: guide.transplanting_months,
        pruning_months: guide.pruning_months,
        fertilizing_months: guide.fertilizing_months,
        harvesting_months: guide.harvesting_months
      },
      steps: guide.guide_steps.map { |step| build_step_response(step) }
    }
  end

  # ステップレスポンスの構築
  def self.build_step_response(step)
    {
      id: step.id,
      title: step.title,
      description: step.description,
      position: step.position,
      due_days: step.due_days
    }
  end
end
