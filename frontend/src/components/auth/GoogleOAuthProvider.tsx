'use client'

import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google'
import { type ReactNode } from 'react'

interface GoogleOAuthProviderProps {
  children: ReactNode
}

export default function GoogleOAuthProvider({ children }: GoogleOAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined')
    return <>{children}</>
  }

  return (
    <GoogleProvider clientId={clientId}>
      {children}
    </GoogleProvider>
  )
}
