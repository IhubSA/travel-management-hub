'use client'

import { MainLayout } from '@/components/layout/MainLayout'

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and view reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900">Travel Summary</h3>
            <p className="text-gray-600 text-sm mt-2">Overview of all travel activities</p>
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Generate Report →</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900">Budget Analysis</h3>
            <p className="text-gray-600 text-sm mt-2">Budget spending and forecast</p>
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Generate Report →</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
            <p className="text-gray-600 text-sm mt-2">User activity and engagement</p>
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Generate Report →</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900">Compliance</h3>
            <p className="text-gray-600 text-sm mt-2">Compliance and audit report</p>
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Generate Report →</button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
