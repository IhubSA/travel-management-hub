// ============================================================================
// Reference data service
//
// Departments, projects and people. This is one of only two places that
// touches the data store, so pointing the app at Supabase means rewriting
// the bodies of these functions — the signatures stay identical.
//
// SUPABASE EQUIVALENT (for later):
//   const { data } = await supabase.from('departments').select('*')
//                       .eq('active', true).order('name')
// ============================================================================

import { db } from '@/lib/mock-db'
import type { DepartmentRow, ProfileRow, ProjectRow } from '@/types/database'

/** Simulated network latency so loading states are exercised honestly. */
const LATENCY_MS = 120

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

export async function listDepartments(): Promise<DepartmentRow[]> {
  return delay(
    db.departments
      .filter((d) => d.active)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  )
}

export async function getDepartment(id: string): Promise<DepartmentRow | null> {
  return delay(db.departments.find((d) => d.id === id) ?? null)
}

export async function listProjects(): Promise<ProjectRow[]> {
  return delay(
    db.projects
      .filter((p) => p.active)
      .slice()
      .sort((a, b) => a.project_code.localeCompare(b.project_code))
  )
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  return delay(db.projects.find((p) => p.id === id) ?? null)
}

export async function listProfiles(): Promise<ProfileRow[]> {
  return delay(
    db.profiles
      .filter((p) => p.active)
      .slice()
      .sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      )
  )
}

export async function getProfile(id: string): Promise<ProfileRow | null> {
  return delay(db.profiles.find((p) => p.id === id) ?? null)
}

/** Everything the wizard's dropdowns need, in one round trip. */
export async function loadReferenceData(): Promise<{
  departments: DepartmentRow[]
  projects: ProjectRow[]
  profiles: ProfileRow[]
}> {
  const [departments, projects, profiles] = await Promise.all([
    listDepartments(),
    listProjects(),
    listProfiles(),
  ])
  return { departments, projects, profiles }
}

/** Display name helper used across list and detail views. */
export function fullName(profile: ProfileRow | null | undefined): string {
  if (!profile) return 'Unknown'
  return `${profile.first_name} ${profile.last_name}`.trim()
}
