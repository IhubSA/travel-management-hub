'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { resetDb } from '@/lib/mock-db'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    theme: 'light',
    language: 'en',
  })

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your application preferences</p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive browser notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Weekly Report</p>
                <p className="text-sm text-gray-600">Receive weekly summary reports</p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyReport}
                onChange={(e) => handleChange('weeklyReport', e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">Zulu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Demo data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Demo data</h3>
          <p className="text-sm text-gray-600 mb-4">
            This build runs on a mock data layer stored in your browser, not on a
            server. Anything you create stays on this device and is invisible to
            anyone else opening the site. Resetting restores the original sample
            departments, projects, staff and travel requests.
          </p>
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Reset all demo data? Any travel requests you have created will be deleted.'
                )
              ) {
                resetDb()
                window.location.href = '/dashboard'
              }
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Reset demo data
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h3>
          <p className="text-sm text-red-800 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
            Export My Data
          </button>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Settings
          </button>
          <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium">
            Cancel
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
