import { ImageResponse } from 'next/og'

// Twitter Card画像のサイズ（推奨: 1200x630）
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export const alt = '家庭菜園チェッカー | おうちの畑'

// Twitter Card画像を動的生成（OGP画像と同じ内容）
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E8FEE9',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '60px 80px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#16a34a',
              marginBottom: '20px',
            }}
          >
            🌱 家庭菜園チェッカー
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#374151',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            あなたにぴったりの野菜を診断
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#6b7280',
              marginTop: '30px',
              textAlign: 'center',
            }}
          >
            おうちの畑 - 家庭菜園を、もっと身近に。
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
