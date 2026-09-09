import type { DepartmentRow, ProfileRow, ProjectRow } from '@/types/database'
import type {
  DraftItinerary,
  TravelRequestDraft,
  ValidationErrors,
} from '@/types/travel-request'

export interface ReferenceData {
  departments: DepartmentRow[]
  projects: ProjectRow[]
  profiles: ProfileRow[]
}

/** Props every wizard step receives from TravelRequestWizard. */
export interface StepProps {
  draft: TravelRequestDraft
  /** Shallow-merge a patch into the draft. */
  update: (patch: Partial<TravelRequestDraft>) => void
  /** Shallow-merge a patch into one itinerary leg. */
  updateItinerary: (index: number, patch: Partial<DraftItinerary>) => void
  errors: ValidationErrors
  reference: ReferenceData
}
