'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ExternalLink, FileUp, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getAssignment } from '@/lib/api/assignments'
import { createSubmission } from '@/lib/api/submissions'
import { openUploadedFile, uploadFile, UploadedFile } from '@/lib/api/uploads'
import { apiErrorMessage } from '@/lib/http/client'

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const { data: assignment } = useQuery({
    queryKey: ['assignment', params.id],
    queryFn: () => getAssignment(params.id),
  })

  const mutation = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => router.push('/student/assignments'),
  })

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploaded = await Promise.all(files.map((file) => uploadFile(file, 'submission').then((res) => res.data)))
      return uploaded
    },
    onSuccess: (files) => setUploadedFiles((current) => [...current, ...files]),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      assignment_id: params.id,
      content: content || undefined,
      external_link: externalLink || undefined,
      file_urls: uploadedFiles.map((file) => file.url),
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) uploadMutation.mutate(files)
    event.target.value = ''
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Submit Assignment</h1>
        <p className="mt-1 text-sm text-slate-400">{assignment?.data?.title || 'Assignment'}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium text-slate-300">Content / Answer</Label>
          <textarea
            id="content"
            className="w-full min-h-[120px] rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your answer here..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link" className="text-sm font-medium text-slate-300">External Link (optional)</Label>
          <Input
            id="link"
            type="url"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://..."
            className="focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="files" className="text-sm font-medium text-slate-300">Upload Files (optional)</Label>
          <label
            htmlFor="files"
            className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.04] px-4 py-5 text-center transition hover:border-blue-400/60 hover:bg-blue-500/5"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-300" />
            ) : (
              <FileUp className="h-6 w-6 text-blue-300" />
            )}
            <span className="mt-2 text-sm font-semibold text-white">เลือกไฟล์ PDF / Word / รูปภาพ</span>
            <span className="mt-1 text-xs text-slate-500">สูงสุด 25MB ต่อไฟล์</span>
          </label>
          <input
            id="files"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp"
            className="sr-only"
            onChange={handleFileSelect}
            disabled={uploadMutation.isPending}
          />
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.url} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                  <button
                    type="button"
                    onClick={() => openUploadedFile(file.url).catch((err) => toast.error(apiErrorMessage(err)))}
                    className="flex min-w-0 items-center gap-2 text-sm text-blue-200 hover:text-blue-100"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span className="truncate">{file.original_name}</span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setUploadedFiles((current) => current.filter((item) => item.url !== file.url))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {uploadMutation.isError && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{apiErrorMessage(uploadMutation.error)}</p>
        )}
        {mutation.isError && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{apiErrorMessage(mutation.error)}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={mutation.isPending || uploadMutation.isPending}>
            {mutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.push('/student/assignments')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
