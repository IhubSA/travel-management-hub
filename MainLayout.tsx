'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // Collapse state lives here so the header and main content shift with the
  // sidebar instead of leaving a gap (or hiding behind it).
  const [collapsed, setCollapsed] = useState(false)
  const offset = collapsed ? 'md:ml-20' : 'md:ml-64'

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className={`${offset} transition-all duration-300`}>
        <Header />
        <main className="px-4 pb-10 pt-6 md:px-8">{children}</main>
      </div>
    </div>
  )
}
