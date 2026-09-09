'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/hooks/useRole'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { role, isSuperAdmin, isCEO, isHOD, isFinance, isTravelOfficer } = useRole()

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center text-gray-600">
          <p>Please log in to access the dashboard</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Travel Management Hub
          </h1>
          <p className="text-gray-600">
            Logged in as <span className="font-medium">{user?.email}</span> • Role:{' '}
            <span className="font-medium text-blue-600">{role || 'Loading...'}</span>
          </p>
        </div>

        {/* Role-Specific Dashboard */}
        {isSuperAdmin && <SuperAdminDashboard />}
        {isCEO && <CEODashboard />}
        {isHOD && <HODDashboard />}
        {isFinance && <FinanceDashboard />}
        {isTravelOfficer && <TravelOfficerDashboard />}

        {/* Default Staff Dashboard if no specific role */}
        {!isSuperAdmin &&
          !isCEO &&
          !isHOD &&
          !isFinance &&
          !isTravelOfficer && <StaffDashboard />}
      </div>
    </MainLayout>
  )
}

function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="48" icon="👥" trend="+3 this week" />
        <StatCard title="Pending Requests" value="12" icon="✈️" trend="2 overdue" />
        <StatCard title="Approved Travels" value="156" icon="✅" trend="+8 this week" />
        <StatCard title="Budget Used" value="R 234,500" icon="💰" trend="62% of annual" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem desc="Jane Smith submitted travel request" time="2 hours ago" />
            <ActivityItem desc="John Doe approved request JD-2024-001" time="4 hours ago" />
            <ActivityItem desc="New user registered: sarah@angels.org.za" time="1 day ago" />
            <ActivityItem desc="Finance report generated for Q3" time="2 days ago" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <SystemStatus label="Database" status="Operational" color="green" />
            <SystemStatus label="Email Service" status="Operational" color="green" />
            <SystemStatus label="API" status="Operational" color="green" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CEODashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Executive Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Approvals" value="5" icon="⏳" trend="Requires attention" />
        <StatCard title="Active Travels" value="8" icon="🌍" trend="This month" />
        <StatCard title="Budget Status" value="62%" icon="📊" trend="YTD spend" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Traveller</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Destination</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Dates</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">Jane Smith</td>
                <td className="px-4 py-3 text-gray-900">Cape Town</td>
                <td className="px-4 py-3 text-gray-600">Sep 15 - 17</td>
                <td className="px-4 py-3 text-center">
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function HODDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Department Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Department Requests" value="8" icon="📋" trend="This quarter" />
        <StatCard title="Staff On Travel" value="3" icon="👨‍💼" trend="Currently" />
        <StatCard title="Budget Remaining" value="R 45,000" icon="💵" trend="Q4 2024" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Team</h3>
        <div className="space-y-2">
          <TeamMember name="Sarah Johnson" email="sarah@angels.org.za" status="Active" />
          <TeamMember name="Mike Davis" email="mike@angels.org.za" status="On Travel" />
          <TeamMember name="Lisa Chen" email="lisa@angels.org.za" status="Active" />
        </div>
      </div>
    </div>
  )
}

function FinanceDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Finance Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Spend" value="R 589,234" icon="💰" trend="YTD" />
        <StatCard title="Budget Allocated" value="R 950,000" icon="📊" trend="2024" />
        <StatCard title="Approvals Pending" value="4" icon="⏳" trend="Awaiting action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget by Department</h3>
          <div className="space-y-3">
            <BudgetBar label="Sales" used={65} color="blue" />
            <BudgetBar label="Operations" used={42} color="green" />
            <BudgetBar label="HR" used={28} color="purple" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            <Transaction desc="Flight Booking - Jane Smith" amount="R 2,450" status="Approved" />
            <Transaction desc="Hotel - Cape Town trip" amount="R 1,200" status="Pending" />
            <Transaction desc="Transport - JNB Transfer" amount="R 350" status="Approved" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TravelOfficerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Travel Officer Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Processing" value="6" icon="⚙️" trend="In progress" />
        <StatCard title="Approved" value="24" icon="✅" trend="This month" />
        <StatCard title="Pending Docs" value="3" icon="📄" trend="Need attention" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests to Process</h3>
        <div className="space-y-2">
          <RequestItem traveller="Jane Smith" status="Awaiting finance approval" />
          <RequestItem traveller="John Doe" status="Missing travel insurance doc" />
          <RequestItem traveller="Sarah Chen" status="Ready to book flights" />
        </div>
      </div>
    </div>
  )
}

function StaffDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="My Requests" value="2" icon="✈️" trend="1 approved, 1 pending" />
        <StatCard title="Approvals" value="1" icon="👥" trend="Waiting for manager" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Travel Requests</h3>
        <div className="space-y-2">
          <MyRequestItem destination="Cape Town" dates="Sep 15-17" status="Approved" />
          <MyRequestItem destination="Johannesburg" dates="Oct 2-5" status="Pending" />
        </div>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + New Travel Request
        </button>
      </div>
    </div>
  )
}

// Helper Components
function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: string
  icon: string
  trend: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{trend}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

function ActivityItem({ desc, time }: { desc: string; time: string }) {
  return (
    <div className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
      <div className="text-2xl">📝</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{desc}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

function SystemStatus({
  label,
  status,
  color,
}: {
  label: string
  status: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-700">{label}</p>
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full bg-${color}-500`}
          style={{ backgroundColor: color === 'green' ? '#10b981' : '#ef4444' }}
        ></div>
        <p className="text-sm font-medium text-gray-900">{status}</p>
      </div>
    </div>
  )
}

function TeamMember({
  name,
  email,
  status,
}: {
  name: string
  email: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50">
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${
          status === 'On Travel'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {status}
      </span>
    </div>
  )
}

function BudgetBar({
  label,
  used,
  color,
}: {
  label: string
  used: number
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  }

  return (
    <div>
      <div className="flex justify-between mb-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-600">{used}%</p>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]}`}
          style={{ width: `${used}%` }}
        ></div>
      </div>
    </div>
  )
}

function Transaction({
  desc,
  amount,
  status,
}: {
  desc: string
  amount: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50">
      <div>
        <p className="text-sm text-gray-900">{desc}</p>
        <p className="text-xs text-gray-500">{status}</p>
      </div>
      <p className="font-semibold text-gray-900">{amount}</p>
    </div>
  )
}

function RequestItem({
  traveller,
  status,
}: {
  traveller: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100">
      <div>
        <p className="font-medium text-gray-900">{traveller}</p>
        <p className="text-sm text-gray-600">{status}</p>
      </div>
      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
        Review
      </button>
    </div>
  )
}

function MyRequestItem({
  destination,
  dates,
  status,
}: {
  destination: string
  dates: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">✈️ {destination}</p>
        <p className="text-sm text-gray-600">{dates}</p>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded ${
          status === 'Approved'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {status}
      </span>
    </div>
  )
}
