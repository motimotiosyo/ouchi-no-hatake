'use client'

import { useAuth } from '@/contexts/AuthContext'
import AutoLogoutModal from './AutoLogoutModal'

export default function AutoLogoutModalContainer() {
  const { showAutoLogoutModal, autoLogoutMessage, confirmAutoLogout } = useAuth()

  return (
    <AutoLogoutModal
      isOpen={showAutoLogoutModal}
      message={autoLogoutMessage || 'セッションの有効期限が切れました。'}
      onConfirm={confirmAutoLogout}
    />
  )
}