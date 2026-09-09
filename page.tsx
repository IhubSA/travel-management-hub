'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useRole } from '@/hooks/useRole'

interface User {
  id: string
  email: string
  name: string
  role: string
  department: string
  status: 'active' | 'inactive'
  joinDate: string
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'jane.smith@angels-travel.example.com',
    name: 'Jane Smith',
    role: 'STAFF',
    department: 'Sales',
    status: 'active',
    joinDate: '2024-01-15',
  },
  {
    id: '2',
    email: 'john.doe@angels-travel.example.com',
    name: 'John Doe',
    role: 'HOD',
    department: 'Operations',
    status: 'active',
    joinDate: '2023-11-20',
  },
  {
    id: '3',
    email: 'sarah.chen@angels-travel.example.com',
    name: 'Sarah Chen',
    role: 'TRAVEL_OFFICER',
    department: 'Travel',
    status: 'active',
    joinDate: '2024-02-01',
  },
  {
    id: '4',
    email: 'mike.johnson@angels-travel.example.com',
    name: 'Mike Johnson',
    role: 'FINANCE',
    department: 'Finance',
    status: 'active',
    joinDate: '2023-09-10',
  },
]

const roles = ['SUPER_ADMIN', 'CEO', 'HOD', 'STAFF', 'TRAVEL_OFFICER', 'FINANCE']

export default function UsersPage() {
  const { isSuperAdmin, isCEO } = useRole()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'STAFF',
    department: '',
  })

  const hasAccess = isSuperAdmin || isCEO

  if (!hasAccess) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-semibold">Access Denied</p>
          <p className="text-red-600 text-sm mt-2">
            You do not have permission to access user management
          </p>
        </div>
      </MainLayout>
    )
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email && formData.name) {
      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        role: formData.role,
        department: formData.department,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
      }
      setUsers([...users, newUser])
      setFormData({ email: '', name: '', role: 'STAFF', department: '' })
      setIsAddingUser(false)
    }
  }

  const handleUpdateRole = (userId: string, newRole: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    setEditingId(null)
  }

  const handleDeactivate = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
      )
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and roles</p>
          </div>
          <button
            onClick={() => setIsAddingUser(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add User
          </button>
        </div>

        {/* Add User Form */}
        {isAddingUser && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@angels-travel.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sales, Operations, etc."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.department}</td>
                    <td className="px-6 py-3 text-sm">
                      {editingId === user.id ? (
                        <div className="flex gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {user.role}
                          </span>
                          <button
                            onClick={() => setEditingId(user.id)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.joinDate}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className={`text-sm font-medium ${
                          user.status === 'active'
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Active Users</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {users.filter((u) => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Inactive Users</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {users.filter((u) => u.status === 'inactive').length}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
