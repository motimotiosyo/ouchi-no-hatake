// Cookie操作のユーティリティ関数

export const setCookie = (name: string, value: string, days: number = 180) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure=true; samesite=none`
  document.cookie = cookieString
}

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

// 重要：Rails側と同じ属性でCookie削除
export const deleteCookie = (name: string) => {
  // パターン1: Rails側と完全に同じ属性
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure=true; samesite=none`
  
  // パターン2: ドメイン指定なし
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  
  // パターン3: ルートパスなし
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  
  // パターン4: max-age使用
  document.cookie = `${name}=; max-age=0; path=/; secure=true; samesite=none`
  
  // パターン5: max-age使用（属性なし）
  document.cookie = `${name}=; max-age=0; path=/`
}