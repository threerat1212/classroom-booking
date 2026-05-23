import { apiFetch } from '@/lib/http/client'

export interface UploadedFile {
  id: string
  url: string
  original_name: string
  mime_type: string
  size_bytes: number
}

interface FileAccessResponse {
  url: string
}

const UPLOAD_DOWNLOAD_PATTERN = /\/api\/v1\/uploads\/([0-9a-fA-F-]{36})\/download(?:[?#].*)?$/

export function extractUploadedFileId(fileUrl: string) {
  return fileUrl.match(UPLOAD_DOWNLOAD_PATTERN)?.[1] ?? null
}

export async function resolveUploadedFileURL(fileUrl: string) {
  const fileId = extractUploadedFileId(fileUrl)
  if (!fileId) return fileUrl

  const res = await apiFetch<{ data: FileAccessResponse }>(`/api/v1/uploads/${fileId}/access`)
  return res.data.url
}

export async function openUploadedFile(fileUrl: string) {
  const popup = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null
  if (popup) popup.opener = null

  try {
    const resolvedURL = await resolveUploadedFileURL(fileUrl)
    if (popup) {
      popup.location.href = resolvedURL
      return
    }
    window.open(resolvedURL, '_blank', 'noopener,noreferrer')
  } catch (err) {
    popup?.close()
    throw err
  }
}

export async function uploadFile(file: File, entityType = 'submission', entityId?: string) {
  const body = new FormData()
  body.append('file', file)
  body.append('entity_type', entityType)
  if (entityId) body.append('entity_id', entityId)

  return apiFetch<{ data: UploadedFile }>('/api/v1/uploads', {
    method: 'POST',
    body,
  })
}
