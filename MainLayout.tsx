'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="md:ml-64 pt-20 pb-8 px-4 md:px-8">
        {children}
      </main>
    </div>
  )
}
