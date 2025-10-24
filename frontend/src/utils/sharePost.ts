/**
 * 投稿をSNSでシェアする共通関数
 * Web Share API（モバイル）とTwitter Intent URL（デスクトップ）に対応
 */

interface SharePostParams {
  title: string
  content: string
  url?: string
}

/**
 * 投稿をSNSでシェアする
 * @param params - シェアパラメータ
 * @returns Promise<boolean> - シェア成功時true、キャンセル時false
 */
export const sharePost = async (params: SharePostParams): Promise<boolean> => {
  const { title, content, url } = params

  // シェアテキストを生成（投稿内容の最初の50文字）
  const truncatedContent = content.length > 50
    ? `${content.substring(0, 50)}...`
    : content
  const shareText = `🌱 おうちの畑 - ${title}\n\n${truncatedContent}\n\n`
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  try {
    // Web Share API（モバイル対応）
    if (navigator.share) {
      await navigator.share({
        title: `おうちの畑 - ${title}`,
        text: shareText,
        url: shareUrl
      })
      return true
    } else {
      // Twitter Intent URL（デスクトップフォールバック）
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + shareUrl)}`
      window.open(twitterUrl, '_blank', 'noopener,noreferrer')
      return true
    }
  } catch (error) {
    // ユーザーがキャンセルした場合
    if (error instanceof Error && error.name === 'AbortError') {
      return false
    }
    // その他のエラー
    if (process.env.NODE_ENV === 'development') {
      console.error('Share failed:', error)
    }
    return false
  }
}
