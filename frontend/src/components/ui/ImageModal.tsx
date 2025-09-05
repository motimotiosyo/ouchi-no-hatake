'use client'

import { useEffect } from 'react'

interface ImageModalProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  title?: string
}

export default function ImageModal({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose, 
  onNavigate,
  title 
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (images.length > 1) {
            onNavigate('prev')
          }
          break
        case 'ArrowRight':
          if (images.length > 1) {
            onNavigate('next')
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, images.length, onClose, onNavigate])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-7xl mx-auto">
        {/* モバイル版: フルスクリーン表示 */}
        <div className="md:hidden flex items-center justify-center h-full p-4">
          <img
            src={currentImage}
            alt={title || `画像 ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* PC版: 左側画像 + 右側情報 */}
        <div className="hidden md:flex h-full">
          {/* 左側: 画像表示エリア */}
          <div className="flex-1 flex items-center justify-center p-8">
            <img
              src={currentImage}
              alt={title || `画像 ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* 右側: 情報表示エリア */}
          <div className="w-80 bg-white p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {title || '画像詳細'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {images.length > 1 && (
              <div className="text-sm text-gray-500 mb-4">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* 閉じるボタン (モバイル版) */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ナビゲーションボタン */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNavigate('prev')
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNavigate('next')
              }}
              className="absolute right-4 md:right-[21rem] top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* インジケーター */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 md:left-1/4 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  const direction = index > currentIndex ? 'next' : 'prev'
                  const steps = Math.abs(index - currentIndex)
                  for (let i = 0; i < steps; i++) {
                    setTimeout(() => onNavigate(direction), i * 100)
                  }
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}