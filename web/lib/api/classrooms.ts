import { apiFetch } from '@/lib/http/client'

export interface Classroom {
  id: string
  name: string
  code: string
  capacity: number
  description?: string
  teacher_id?: string
  teacher_name?: string
  join_code?: string
  student_count: number
  joined_at?: string
  created_at: string
  updated_at: string
}

export interface LearningMaterial {
  id: string
  classroom_id: string
  teacher_id: string
  title: string
  description?: string
  material_type: 'text' | 'file' | 'youtube' | 'link' | 'ai_summary'
  content?: string
  url?: string
  file_urls: string[]
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface CreateClassroomInput {
  name: string
  code?: string
  capacity?: number
  description?: string
}

export interface CreateLearningMaterialInput {
  title: string
  description?: string
  material_type: LearningMaterial['material_type']
  content?: string
  url?: string
  file_urls?: string[]
  sort_order?: number
  is_published?: boolean
}

export function listClassrooms() {
  return apiFetch<{ data: Classroom[] }>('/api/v1/classrooms')
}

export function getClassroom(id: string) {
  return apiFetch<{ data: Classroom }>(`/api/v1/classrooms/${id}`)
}

export function createClassroom(data: CreateClassroomInput) {
  return apiFetch<{ data: Classroom }>('/api/v1/classrooms', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function joinClassroom(joinCode: string) {
  return apiFetch<{ data: Classroom }>('/api/v1/classrooms/join', {
    method: 'POST',
    body: JSON.stringify({ join_code: joinCode }),
  })
}

export function listLearningMaterials(classroomId: string) {
  return apiFetch<{ data: LearningMaterial[] }>(`/api/v1/classrooms/${classroomId}/materials`)
}

export function createLearningMaterial(classroomId: string, data: CreateLearningMaterialInput) {
  return apiFetch<{ data: LearningMaterial }>(`/api/v1/classrooms/${classroomId}/materials`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteLearningMaterial(classroomId: string, materialId: string) {
  return apiFetch<void>(`/api/v1/classrooms/${classroomId}/materials/${materialId}`, {
    method: 'DELETE',
  })
}
