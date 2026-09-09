'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageHeader } from '@/components/common'
import { TravelRequestWizard } from '@/components/travel-request/TravelRequestWizard'

export default function EditTravelRequestPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === 'string' ? params.id : ''

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Edit travel request"
          description="Only drafts can be edited. Once submitted, changes go through the approver."
        />

        <nav className="text-sm text-gray-500">
          <Link href="/travel-requests" className="hover:underline">
            Travel requests
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Edit draft</span>
        </nav>

        <TravelRequestWizard requestId={id} />
      </div>
    </MainLayout>
  )
}
