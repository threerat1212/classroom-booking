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

export interface CreateClassroomInput {
  name: string
  code?: string
  capacity?: number
  description?: string
}

export function listClassrooms() {
  return apiFetch<{ data: Classroom[] }>('/api/v1/classrooms')
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
