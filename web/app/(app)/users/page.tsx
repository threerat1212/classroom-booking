'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { RowActions } from '@/components/shared/row-actions'
import { apiFetch } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  status: string
  created_at: string
}

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiFetch<{ data: User[] | null }>('/api/v1/users')
      return res.data || []
    },
  })
}

export default function UsersPage() {
  const router = useRouter()
  const { data: users, isLoading, error, refetch } = useUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Manage system users and roles</p>
        </div>
        <Button onClick={() => router.push('/users/new')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      <DataTable
        columns={[
          { key: 'name', header: 'Name', cell: (u) => <span className="font-medium">{u.full_name}</span> },
          { key: 'email', header: 'Email', cell: (u) => u.email },
          { key: 'role', header: 'Role', cell: (u) => <StatusBadge status={u.role} /> },
          { key: 'status', header: 'Status', cell: (u) => <StatusBadge status={u.status} /> },
          { key: 'created', header: 'Created', cell: (u) => new Date(u.created_at).toLocaleDateString() },
          { key: 'actions', header: '', cell: (u) => (
            <RowActions onEdit={() => router.push(`/users/${u.id}`)} />
          )},
        ]}
        data={users}
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load users"
        onRetry={refetch}
        emptyTitle="No users yet"
        emptyMessage="Get started by adding your first user."
      />
    </div>
  )
}
