class MigrateGuideStepsToPhaseStructure < ActiveRecord::Migration[7.2]
  def up
    # 既存のguide_stepsに対して、titleとpositionから推測してphaseとapplicable_toを割り当て
    GuideStep.reset_column_information

    GuideStep.find_each do |step|
      phase = determine_phase(step)
      applicable_to = determine_applicable_to(step)

      step.update_columns(phase: phase, applicable_to: applicable_to)
    end
  end

  def down
    # ロールバック時はphaseとapplicable_toをデフォルト値に戻す
    GuideStep.update_all(phase: 0, applicable_to: 'all')
  end

  private

  def determine_phase(step)
    title = step.title.to_s
    position = step.position

    # より具体的なマッチングを優先（順序が重要）
    case title
    when /種まき.*準備|種まき.*苗/
      # 「種まき・苗の準備」のような複合タイトル
      1 # 種まき（フェーズ1として扱う）
    when /種まき|播種/
      1 # 種まき
    when /育苗|苗床/
      2 # 育苗
    when /苗の準備/
      # 「苗の準備」のみ（苗からスタート）
      3 # 苗準備
    when /植[え付]?付|定植/
      3 # 植え付け
    when /わき芽|摘芯|整枝|間引き|摘[心果]|誘引|支柱/
      4 # 育成管理
    when /追肥|肥料/
      5 # 追肥
    when /収穫|採[取種]|収[取穫]/
      6 # 収穫
    when /準備|土|資材/
      # 単純な「準備」のみ（栽培準備）
      0 # 栽培準備
    else
      # タイトルから判断できない場合はpositionから推測
      case position
      when 1
        # 1番目のステップ
        if title.match?(/苗/)
          3 # 苗の準備（苗からスタートの品種）
        else
          1 # 種まき（種からスタートの品種）
        end
      when 2
        3 # 2番目は通常「植え付け」
      when 3
        4 # 3番目は通常「育成管理」
      when 4
        5 # 4番目は通常「追肥」
      when 5
        6 # 5番目は通常「収穫」
      else
        4 # その他は育成管理とする
      end
    end
  end

  def determine_applicable_to(step)
    title = step.title.to_s
    phase = determine_phase(step)

    case phase
    when 0
      'all' # 栽培準備は全て
    when 1
      # 種まきフェーズ
      if title.match?(/種まき/)
        'seed_only'
      else
        'direct_sow' # 直播き品種（レタス等）
      end
    when 2
      'seed_only' # 育苗は種からのみ
    when 3
      # 植え付けフェーズ
      if title.match?(/苗の準備/)
        'seedling_only' # 苗から始める品種
      else
        'all' # 植え付けは種・苗両方
      end
    when 4, 5, 6
      'all' # 育成管理、追肥、収穫は全て
    else
      'all'
    end
  end
end
