class CheckerService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  # 質問一覧の取得とレスポンス構築
  def self.fetch_questions
    questions = Question.includes(choices: :choice_scores).order(:id)

    if questions.empty?
      raise ValidationError.new("質問データが見つかりません")
    end

    questions_data = questions.map { |question| build_question_response(question) }

    ApplicationSerializer.success(data: { questions: questions_data })
  end

  # 診断実行とレスポンス構築
  def self.diagnose(choice_ids)
    # バリデーション
    validate_choice_ids(choice_ids)

    # スコア計算
    plant_scores = calculate_plant_scores(choice_ids)

    # 結果構築
    results = build_diagnosis_results(plant_scores)

    # 選択した内容を取得
    selected_choices = build_selected_choices(choice_ids)

    ApplicationSerializer.success(data: { results: results, selected_choices: selected_choices })
  rescue ActiveRecord::RecordNotFound => e
    raise ValidationError.new("指定された選択肢が見つかりません")
  end

  private

  # 質問レスポンスの構築
  def self.build_question_response(question)
    {
      id: question.id,
      text: question.text,
      choices: question.choices.map { |choice| build_choice_response(choice) }
    }
  end

  # 選択肢レスポンスの構築
  def self.build_choice_response(choice)
    {
      id: choice.id,
      text: choice.text
    }
  end

  # 選択肢IDのバリデーション
  def self.validate_choice_ids(choice_ids)
    if choice_ids.blank? || !choice_ids.is_a?(Array)
      raise ValidationError.new("選択肢を選んでください")
    end

    # すべての選択肢が存在するかチェック
    existing_choice_ids = Choice.where(id: choice_ids).pluck(:id)
    if existing_choice_ids.size != choice_ids.size
      raise ValidationError.new("無効な選択肢が含まれています")
    end

    # 各質問から1つずつ選択されているかチェック
    question_ids = Choice.where(id: choice_ids).pluck(:question_id)
    if question_ids.size != question_ids.uniq.size
      raise ValidationError.new("各質問から1つずつ選択してください")
    end
  end

  # 植物ごとのスコア計算
  def self.calculate_plant_scores(choice_ids)
    plant_scores = Hash.new(0)
    # 質問1（栽培場所）と質問5（野菜種類）の選択肢を特定
    location_choice_id = nil
    vegetable_type_choice_id = nil

    # 各選択肢がどの質問に属するかを確認
    Choice.where(id: choice_ids).includes(:question).find_each do |choice|
      case choice.question.text
      when "栽培場所はどこがいいですか？"
        location_choice_id = choice.id
      when "どんな野菜を育てたいですか？"
        vegetable_type_choice_id = choice.id
      end
    end

    # 全ての選択肢のスコアを集計し、除外対象の植物を特定
    excluded_plants = Set.new

    ChoiceScore.includes(:plant).where(choice_id: choice_ids).find_each do |choice_score|
      # 質問1または質問5で0点の植物は除外対象
      if (choice_score.choice_id == location_choice_id ||
          choice_score.choice_id == vegetable_type_choice_id) &&
         choice_score.score == 0
        excluded_plants.add(choice_score.plant)
      end

      # スコア集計（後で除外対象を削除）
      plant_scores[choice_score.plant] += choice_score.score
    end

    # 除外対象の植物を削除
    excluded_plants.each do |plant|
      plant_scores.delete(plant)
    end

    # スコアの降順でソート
    plant_scores.sort_by { |plant, score| -score }.to_h
  end

  # 診断結果の構築
  def self.build_diagnosis_results(plant_scores)
    plant_scores.map do |plant, score|
      {
        plant: {
          id: plant.id,
          name: plant.name,
          description: plant.description
        },
        score: score
      }
    end
  end

  # 選択した内容の構築
  def self.build_selected_choices(choice_ids)
    Choice.where(id: choice_ids).includes(:question).map do |choice|
      {
        question_text: choice.question.text,
        choice_text: choice.text
      }
    end
  end
end
