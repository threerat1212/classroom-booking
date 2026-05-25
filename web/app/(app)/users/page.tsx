'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { RowActions } from '@/components/shared/row-actions'
import { apiFetch } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/lib/context/language-context'

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
  const { t } = useLanguage()
  const { data: users, isLoading, error, refetch } = useUsers()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{t('users_title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('users_subtitle')}</p>
        </div>
        <Button
          variant="brand"
          onClick={() => router.push('/users/new')}
          leftIcon={<Plus className="h-4 w-4" />}
          className="self-start sm:self-auto"
        >
          {t('users_add')}
        </Button>
      </div>
      <DataTable
        columns={[
          { key: 'name', header: 'Name', cell: (u) => <span className="font-medium text-slate-900">{u.full_name}</span> },
          { key: 'email', header: 'Email', cell: (u) => <span className="text-slate-600">{u.email}</span> },
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
        errorMessage="ไม่สามารถโหลดข้อมูลผู้ใช้ได้"
        onRetry={refetch}
        emptyTitle={t('users_empty_title')}
        emptyMessage={t('users_empty_message')}
      />
    </div>
  )
}
