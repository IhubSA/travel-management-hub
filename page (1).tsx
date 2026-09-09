'use client'

import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageHeader } from '@/components/common'
import { TravelRequestWizard } from '@/components/travel-request/TravelRequestWizard'

export default function NewTravelRequestPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="New travel request"
          description="Seven short steps. You can save a draft at any point and come back to it."
        />

        <nav className="text-sm text-gray-500">
          <Link href="/travel-requests" className="hover:underline">
            Travel requests
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">New request</span>
        </nav>

        <TravelRequestWizard />
      </div>
    </MainLayout>
  )
}
