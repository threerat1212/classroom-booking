'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getAssignment } from '@/lib/api/assignments'
import { createSubmission } from '@/lib/api/submissions'
import { apiErrorMessage } from '@/lib/http/client'

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [externalLink, setExternalLink] = useState('')

  const { data: assignment } = useQuery({
    queryKey: ['assignment', params.id],
    queryFn: () => getAssignment(params.id),
  })

  const mutation = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => router.push('/student/assignments'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      assignment_id: params.id,
      content,
      external_link: externalLink,
    })
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
        {mutation.isError && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{apiErrorMessage(mutation.error)}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={mutation.isPending}>
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
