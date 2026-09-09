'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'

export default function TravelRequestsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Travel Requests</h1>
            <p className="text-gray-600 mt-2">View and manage travel requests</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            + New Request
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="text-lg font-semibold text-gray-900">No travel requests yet</h3>
            <p className="text-gray-600 mt-2">Create your first travel request to get started</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
