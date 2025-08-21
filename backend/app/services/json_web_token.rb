class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base.to_s

  # トークン発行
  def self.encode(payload, exp = 6.months.from_now)
    payload[:exp] = exp.to_i
    payload[:jti] = SecureRandom.uuid
    JWT.encode(payload, SECRET_KEY)
  end

  # 署名検証とデコード
  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  rescue JWT::DecodeError => e
    raise ExceptionHandler::InvalidToken, e.message
  end

  # トークンチェック
  def self.valid_token?(token)
    decoded_token = decode(token)
    jti = decoded_token[:jti]

    return false if jti.nil?
    !JwtBlacklist.blacklisted?(jti)
  rescue ExceptionHandler::InvalidToken, StandardError
    false
  end

  # ブラックリストに追加
  def self.blacklist_token(token)
    decoded_token = decode(token)
    jti = decoded_token[:jti]
    expires_at = Time.at(decoded_token[:exp])

    return false if jti.nil?

    JwtBlacklist.add_to_blacklist(jti, expires_at)
    true
  rescue ExceptionHandler::InvalidToken, StandardError => e
    Rails.logger.error "Failed to backlist token: #{e.message}"
    false
  end

  # JTI取得　→　デバッグ・管理用
  def self.get_jti(token)
    decoded_token = decode(token)
    decoded_token[:jti]
  rescue ExceptionHandler::InvalidToken, StandardError
    nil
  end
end
