'use client'

import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = '選択してください',
  required = false,
  disabled = false,
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-left flex justify-between items-center ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
            : 'bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
        }`}
        style={{ fontSize: '16px' }}
      >
        <span className={selectedOption ? (disabled ? 'text-gray-600' : 'text-gray-900') : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-3 text-left hover:bg-green-50 transition-colors ${
                option.value === value ? 'bg-green-100 text-green-900 font-medium' : 'text-gray-900'
              }`}
              style={{ fontSize: '16px' }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* 隠しinput要素でフォーム送信に対応 */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />
    </div>
  )
}
