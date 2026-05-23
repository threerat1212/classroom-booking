'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, FileText, Link as LinkIcon, Loader2, PlayCircle, Plus, Sparkles, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { apiErrorMessage, apiFetch } from '@/lib/http/client'
import {
  LearningMaterial,
  createLearningMaterial,
  deleteLearningMaterial,
  getClassroom,
  listLearningMaterials,
} from '@/lib/api/classrooms'
import { listAssignments } from '@/lib/api/assignments'
import { openUploadedFile, uploadFile } from '@/lib/api/uploads'

const materialIcons = {
  text: FileText,
  file: FileText,
  youtube: PlayCircle,
  link: LinkIcon,
  ai_summary: Sparkles,
} as const

interface Quest {
  id: string
  title: string
  topic: string
  difficulty: string
  exp_reward: number
  classroom_id?: string
}

function MaterialCard({ material, canManage, onDelete }: { material: LearningMaterial; canManage: boolean; onDelete: (id: string) => void }) {
  const Icon = materialIcons[material.material_type]
  const youtubeEmbed = material.material_type === 'youtube' && material.url
    ? material.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
    : null

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">{material.title}</h3>
            {material.description && <p className="mt-1 text-sm text-slate-400">{material.description}</p>}
          </div>
        </div>
        {canManage && (
          <Button variant="ghost" size="icon" onClick={() => onDelete(material.id)} aria-label="Delete material">
            <Trash2 className="h-4 w-4 text-red-300" />
          </Button>
        )}
      </div>

      {material.content && (
        <p className="mt-4 whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950/40 p-3 text-sm leading-6 text-slate-200">
          {material.content}
        </p>
      )}

      {youtubeEmbed && (
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
          <iframe
            src={youtubeEmbed}
            title={material.title}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {material.url && material.material_type !== 'youtube' && (
        <Button asChild variant="outline" className="mt-4">
          <a href={material.url} target="_blank" rel="noreferrer">
            Open Resource
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      )}

      {material.file_urls.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {material.file_urls.map((url, index) => (
            <Button
              key={`${url}-${index}`}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openUploadedFile(url).catch((err) => toast.error(apiErrorMessage(err)))}
            >
              File {index + 1}
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ClassroomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { role } = useCurrentUser()
  const canManage = role === 'teacher' || role === 'admin'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [materialType, setMaterialType] = useState<LearningMaterial['material_type']>('text')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [fileUrls, setFileUrls] = useState('')

  const classroomQuery = useQuery({
    queryKey: ['classroom', id],
    queryFn: () => getClassroom(id),
    enabled: !!id,
  })

  const materialsQuery = useQuery({
    queryKey: ['classroom-materials', id],
    queryFn: async () => (await listLearningMaterials(id)).data ?? [],
    enabled: !!id,
  })

  const assignmentsQuery = useQuery({
    queryKey: ['classroom-assignments', id],
    queryFn: async () => (await listAssignments()).data ?? [],
    enabled: !!id,
  })

  const questsQuery = useQuery({
    queryKey: ['classroom-quests', id],
    queryFn: async () => {
      const res = await apiFetch<{ data: Quest[] | null }>('/api/v1/quests')
      return res.data ?? []
    },
    enabled: !!id,
  })

  const assignments = useMemo(
    () => (assignmentsQuery.data ?? []).filter((assignment) => assignment.room_id === id),
    [assignmentsQuery.data, id],
  )
  const quests = useMemo(
    () => (questsQuery.data ?? []).filter((quest) => quest.classroom_id === id),
    [questsQuery.data, id],
  )

  const createMutation = useMutation({
    mutationFn: () => createLearningMaterial(id, {
      title,
      description: description || undefined,
      material_type: materialType,
      content: content || undefined,
      url: url || undefined,
      file_urls: fileUrls.split('\n').map((item) => item.trim()).filter(Boolean),
      is_published: true,
    }),
    onSuccess: () => {
      toast.success('Learning material added')
      setTitle('')
      setDescription('')
      setMaterialType('text')
      setUrl('')
      setContent('')
      setFileUrls('')
      queryClient.invalidateQueries({ queryKey: ['classroom-materials', id] })
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const uploadMaterialMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploaded = await Promise.all(files.map((file) => uploadFile(file, 'learning_material', id).then((res) => res.data)))
      return uploaded
    },
    onSuccess: (files) => {
      const currentUrls = fileUrls.split('\n').map((item) => item.trim()).filter(Boolean)
      setMaterialType('file')
      setFileUrls([...currentUrls, ...files.map((file) => file.url)].join('\n'))
      toast.success('File uploaded')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (materialId: string) => deleteLearningMaterial(id, materialId),
    onSuccess: () => {
      toast.success('Learning material deleted')
      queryClient.invalidateQueries({ queryKey: ['classroom-materials', id] })
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const classroom = classroomQuery.data?.data
  const materials = materialsQuery.data ?? []
  const materialFileUrls = fileUrls.split('\n').map((item) => item.trim()).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/classrooms')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{classroom?.name ?? 'Classroom'}</h1>
            <p className="mt-1 text-sm text-slate-400">{classroom?.code}</p>
          </div>
        </div>
      </div>

      {canManage && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            createMutation.mutate()
          }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Add Learning Material</h2>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" required />
            <select
              value={materialType}
              onChange={(event) => setMaterialType(event.target.value as LearningMaterial['material_type'])}
              className="h-10 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white"
            >
              <option value="text">Text</option>
              <option value="ai_summary">AI Summary</option>
              <option value="youtube">YouTube</option>
              <option value="link">Link</option>
              <option value="file">File</option>
            </select>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="URL / YouTube link" />
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description" />
            <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Lesson notes or summary" className="lg:col-span-2" />
            <Textarea value={fileUrls} onChange={(event) => setFileUrls(event.target.value)} placeholder="File URLs, one per line" className="lg:col-span-2" />
            <div className="lg:col-span-2">
              <label
                htmlFor="material-files"
                className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.04] px-4 py-4 text-center transition hover:border-blue-400/60 hover:bg-blue-500/5"
              >
                {uploadMaterialMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
                ) : (
                  <Upload className="h-5 w-5 text-blue-300" />
                )}
                <span className="mt-2 text-sm font-semibold text-white">Upload files from this device</span>
                <span className="mt-1 text-xs text-slate-500">PDF, Word, PowerPoint, Excel, text, or images up to 25MB</span>
              </label>
              <input
                id="material-files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp"
                className="sr-only"
                disabled={uploadMaterialMutation.isPending}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? [])
                  if (files.length > 0) uploadMaterialMutation.mutate(files)
                  event.target.value = ''
                }}
              />
              {materialFileUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {materialFileUrls.map((item, index) => (
                    <span key={`${item}-${index}`} className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                      File {index + 1}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button type="submit" className="mt-4" disabled={createMutation.isPending || uploadMaterialMutation.isPending || !title.trim()}>
            {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Material
          </Button>
        </form>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Learning Materials</h2>
            <p className="mt-1 text-sm text-slate-400">Files, videos, links, and summaries for review</p>
          </div>
          {materialsQuery.isLoading ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : materials.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
              No learning materials yet
            </div>
          ) : (
            materials.map((material) => (
              <MaterialCard key={material.id} material={material} canManage={canManage} onDelete={(materialId) => deleteMutation.mutate(materialId)} />
            ))
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-white">Assignments</h2>
            <div className="mt-3 space-y-2">
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-400">No assignments linked</p>
              ) : (
                assignments.map((assignment) => (
                  <Link key={assignment.id} href={role === 'student' ? `/student/submissions/${assignment.id}` : `/assignments/${assignment.id}`} className="block rounded-lg border border-white/10 bg-slate-950/40 p-3 transition hover:bg-white/10">
                    <p className="text-sm font-medium text-white">{assignment.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{assignment.status} · {assignment.max_score ?? 100} pts</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-white">Learning Quests</h2>
            <div className="mt-3 space-y-2">
              {quests.length === 0 ? (
                <p className="text-sm text-slate-400">No quests linked</p>
              ) : (
                quests.slice(0, 6).map((quest) => (
                  <Link key={quest.id} href={role === 'student' ? `/student/quests/${quest.id}` : '/teacher/quests'} className="block rounded-lg border border-white/10 bg-slate-950/40 p-3 transition hover:bg-white/10">
                    <p className="text-sm font-medium text-white">{quest.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{quest.difficulty} · +{quest.exp_reward} EXP</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
