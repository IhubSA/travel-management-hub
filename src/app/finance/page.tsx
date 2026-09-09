'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'

export default function FinancePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600 mt-2">Budget tracking and expense management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Budget</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">R 950,000</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Spent</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">R 589,234</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Remaining</p>
            <p className="text-3xl font-bold text-green-600 mt-2">R 360,766</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="text-center py-12 text-gray-500">
            <p>No transactions yet</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
