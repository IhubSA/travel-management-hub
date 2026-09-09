'use client'

import { AuthProvider } from '@/context/AuthContext'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
