import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'

interface CrudConfig<TItem, TFilters, TCreate, TUpdate> {
  keyPrefix: string
  listFn: (filters: TFilters) => Promise<TItem[]>
  detailFn: (id: string) => Promise<TItem>
  createFn: (data: TCreate) => Promise<TItem>
  updateFn: (id: string, data: TUpdate) => Promise<TItem>
  deleteFn: (id: string) => Promise<void>
}

export function createCrudHooks<TItem, TFilters extends Record<string, unknown>, TCreate, TUpdate>(
  config: CrudConfig<TItem, TFilters, TCreate, TUpdate>,
) {
  const keys = {
    all: [config.keyPrefix] as const,
    lists: () => [...keys.all, 'list'] as const,
    list: (filters: TFilters) => [...keys.lists(), filters] as const,
    details: () => [...keys.all, 'detail'] as const,
    detail: (id: string) => [...keys.details(), id] as const,
  }

  function useList(filters: TFilters, options?: Omit<UseQueryOptions<TItem[], Error>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: keys.list(filters),
      queryFn: () => config.listFn(filters),
      ...options,
    })
  }

  function useDetail(id: string | null, options?: Omit<UseQueryOptions<TItem, Error>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: keys.detail(id ?? ''),
      queryFn: () => config.detailFn(id!),
      enabled: !!id,
      ...options,
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: config.createFn,
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.lists() }),
    })
  }

  function useUpdate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: TUpdate }) => config.updateFn(id, data),
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: keys.detail(vars.id) })
        qc.invalidateQueries({ queryKey: keys.lists() })
      },
    })
  }

  function useDelete() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: config.deleteFn,
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.lists() }),
    })
  }

  return { keys, useList, useDetail, useCreate, useUpdate, useDelete }
}
