'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ImageModalState {
  isOpen: boolean
  images: string[]
  currentIndex: number
  title?: string
}

interface ImageModalContextType {
  modalState: ImageModalState
  openModal: (images: string[], initialIndex?: number, title?: string) => void
  closeModal: () => void
  navigateImage: (direction: 'prev' | 'next') => void
}

const ImageModalContext = createContext<ImageModalContextType | undefined>(undefined)

interface ImageModalProviderProps {
  children: ReactNode
}

export function ImageModalProvider({ children }: ImageModalProviderProps) {
  const [modalState, setModalState] = useState<ImageModalState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: undefined
  })

  const openModal = (images: string[], initialIndex = 0, title?: string) => {
    setModalState({
      isOpen: true,
      images,
      currentIndex: initialIndex,
      title
    })
  }

  const closeModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    setModalState(prev => {
      if (!prev.isOpen || prev.images.length <= 1) return prev

      let newIndex = prev.currentIndex
      if (direction === 'next') {
        newIndex = (prev.currentIndex + 1) % prev.images.length
      } else {
        newIndex = prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
      }

      return {
        ...prev,
        currentIndex: newIndex
      }
    })
  }

  return (
    <ImageModalContext.Provider 
      value={{ 
        modalState, 
        openModal, 
        closeModal, 
        navigateImage 
      }}
    >
      {children}
    </ImageModalContext.Provider>
  )
}

export function useImageModal() {
  const context = useContext(ImageModalContext)
  if (context === undefined) {
    throw new Error('useImageModal must be used within an ImageModalProvider')
  }
  return context
}