'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'

export default function ApprovalsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve pending requests</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900">No pending approvals</h3>
            <p className="text-gray-600 mt-2">All requests have been reviewed</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
