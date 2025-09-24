/**
 * 環境制御対応統一Loggerクラス
 * 開発環境: 全てのログレベルを出力
 * 本番環境: infoレベル以上のみ出力、機密情報フィルタリング
 */
class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * デバッグ情報出力（開発環境のみ）
   * 本番環境では出力されません
   */
  static debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args)
    }
  }

  /**
   * 一般情報出力（全環境）
   * ユーザー操作や重要な状態変更などに使用
   */
  static info(message: string, context?: Record<string, any>) {
    const logMessage = `[INFO] ${new Date().toISOString()} - ${message}`
    if (context && this.isDevelopment) {
      console.info(logMessage, context)
    } else {
      console.info(logMessage)
    }
  }

  /**
   * 警告出力（全環境）
   * 問題の可能性があるが処理は継続する場合に使用
   */
  static warn(message: string, context?: Record<string, any>) {
    const logMessage = `[WARN] ${new Date().toISOString()} - ${message}`
    if (context && this.isDevelopment) {
      console.warn(logMessage, context)
    } else {
      console.warn(logMessage)
    }
  }

  /**
   * エラー出力（全環境）
   * エラー情報は機密情報をフィルタリングして出力
   */
  static error(message: string, error?: Error, context?: Record<string, any>) {
    const timestamp = new Date().toISOString()
    const logMessage = `[ERROR] ${timestamp} - ${message}`
    
    if (this.isDevelopment && error) {
      // 開発環境では詳細なエラー情報を出力
      console.error(logMessage, {
        error: error.message,
        stack: error.stack,
        context
      })
    } else {
      // 本番環境では安全な情報のみ出力
      console.error(logMessage, error?.message ? { error: error.message } : undefined)
    }
  }

  /**
   * ユーザー操作ログ（全環境）
   * ユーザーの重要な操作を記録
   */
  static userAction(action: string, userId?: number, details?: Record<string, any>) {
    const timestamp = new Date().toISOString()
    const logMessage = `[USER] ${timestamp} - ${action}`
    
    if (this.isDevelopment && details) {
      console.info(logMessage, { userId, details })
    } else {
      console.info(logMessage, userId ? { userId } : undefined)
    }
  }

  /**
   * API呼び出しログ（開発環境のみ）
   * API通信の詳細情報を記録
   */
  static apiCall(method: string, endpoint: string, status?: number, duration?: number) {
    if (this.isDevelopment) {
      const logMessage = `[API] ${new Date().toISOString()} - ${method} ${endpoint}`
      console.log(logMessage, status ? { status, duration } : undefined)
    }
  }

  /**
   * 認証関連ログ（セキュリティ重要）
   * 機密情報は一切出力しない
   */
  static auth(message: string, userId?: number) {
    const timestamp = new Date().toISOString()
    const logMessage = `[AUTH] ${timestamp} - ${message}`
    
    if (userId) {
      console.info(logMessage, { userId })
    } else {
      console.info(logMessage)
    }
  }
}

export default Logger