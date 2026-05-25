'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LogIn,
  Building2,
  User,
  Globe,
  Phone,
  Mail,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch, apiErrorMessage } from '@/lib/http/client'
import { useLanguage } from '@/lib/context/language-context'

interface Room {
  id: string
  name: string
  code: string
  room_type: string
  capacity: number
  floor: number
  building: string
  description: string
  amenities: string[]
  status: string
}

function useMeetingRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<{ data: Room[] }>('/api/v1/public/rooms?room_type=meeting_room')
      .then((res) => {
        const meetingRooms = res.data.filter((r) =>
          ['meeting_room', 'auditorium'].includes(r.room_type)
        )
        setRooms(meetingRooms)
      })
      .catch(() => setError('ไม่สามารถโหลดรายการห้องได้'))
      .finally(() => setLoading(false))
  }, [])

  return { rooms, loading, error }
}

function RoomCard({ room, selected, onClick, t, lang }: { room: Room; selected: boolean; onClick: () => void; t: any; lang: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative w-full rounded-xl border p-5 text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200 shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-sm'
      }`}
    >
      {selected && (
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-blue-500/20" />
      )}

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-950 tracking-tight">{room.name}</h3>
          <p className="mt-1 text-xs text-slate-500 font-mono">{room.code}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${
            room.status === 'available'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {room.status === 'available' ? (lang === 'th' ? 'ว่าง' : 'Available') : room.status}
        </span>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-slate-500" />
          {room.capacity} {t('capacity_people')}
        </span>
        <span className="flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5 text-slate-500" />
          {t('floor_label')} {room.floor} · {room.building}
        </span>
      </div>
      {room.description && (
        <p className="relative z-10 mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">{room.description}</p>
      )}
    </motion.button>
  )
}

export default function MeetingRoomsPage() {
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()
  const { rooms, loading, error } = useMeetingRooms()

  const [selectedRoom, setSelectedRoom] = useState('')
  const [title, setTitle] = useState('')
  const [purpose, setPurpose] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [requesterEmail, setRequesterEmail] = useState('')
  const [requesterPhone, setRequesterPhone] = useState('')
  const [description, setDescription] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const startTimeRef = useRef<HTMLInputElement>(null)
  const endTimeRef = useRef<HTMLInputElement>(null)

  const now = new Date()
  const minDate = now.toISOString().slice(0, 16)

  const openPicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current && 'showPicker' in ref.current) {
      try {
        ;(ref.current as any).showPicker()
      } catch {
        // Fallback
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccess(false)

    try {
      await apiFetch('/api/v1/public/bookings', {
        method: 'POST',
        body: JSON.stringify({
          room_id: selectedRoom,
          title,
          purpose,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          description: description || undefined,
          requester_name: requesterName,
          requester_email: requesterEmail,
          requester_phone: requesterPhone || undefined,
        }),
      })
      setSuccess(true)
      setSelectedRoom('')
      setTitle('')
      setPurpose('')
      setStartTime('')
      setEndTime('')
      setRequesterName('')
      setRequesterEmail('')
      setRequesterPhone('')
      setDescription('')
    } catch (err) {
      setSubmitError(apiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="legacy-light-surface relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/70">
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Building2 className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">RoomBooking</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 px-3 rounded-lg"
            >
              <Globe className="mr-1.5 h-3.5 w-3.5" />
              <span>{lang === 'th' ? 'EN' : 'TH'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('home')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/login')}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {t('login')}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            {t('public_booking_title')}
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-xl">
            {t('public_booking_subtitle')}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mx-auto max-w-md rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center backdrop-blur-sm shadow-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-white tracking-tight">{t('booking_success_title')}</h2>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                {t('booking_success_desc')}
              </p>
              <Button
                className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/10 hover:from-blue-600 hover:to-indigo-700 w-full"
                onClick={() => setSuccess(false)}
              >
                {t('book_more')}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-8 lg:grid-cols-5 items-start"
            >
              {/* Room Selection */}
              <div className="lg:col-span-2">
                <div className="glass-panel rounded-2xl p-6 shadow-xl backdrop-blur-md">
                  <h2 className="flex items-center gap-2.5 text-base font-bold text-white border-b border-white/5 pb-4 mb-4">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    {t('select_meeting_room')}
                  </h2>

                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2.5 rounded-lg bg-red-500/5 border border-red-500/20 p-4 text-xs text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {rooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          selected={selectedRoom === room.id}
                          onClick={() => setSelectedRoom(room.id)}
                          t={t}
                          lang={lang}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-3">
                <form
                  onSubmit={handleSubmit}
                  className="glass-panel rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6"
                >
                  <h2 className="flex items-center gap-2.5 text-base font-bold text-white border-b border-white/5 pb-4">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    {t('booking_info')}
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">{t('booking_title_label')}</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('booking_title_placeholder')}
                        required
                        className="glass-input text-white placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 px-3.5 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">{t('purpose_label')}</Label>
                      <Select value={purpose} onValueChange={setPurpose} required>
                        <SelectTrigger className="glass-input border-white/10 bg-white/5 text-white focus:ring-0 focus:ring-offset-0 text-sm h-10 px-3.5 rounded-lg">
                          <SelectValue placeholder={t('purpose_placeholder')} />
                        </SelectTrigger>
                        <SelectContent className="border-white/5 bg-[#0d0f17] text-white">
                          <SelectItem value="meeting" className="text-slate-200 focus:bg-white/5 focus:text-white py-2">
                            {t('purpose_meeting')}
                          </SelectItem>
                          <SelectItem value="event" className="text-slate-200 focus:bg-white/5 focus:text-white py-2">
                            {t('purpose_event')}
                          </SelectItem>
                          <SelectItem value="other" className="text-slate-200 focus:bg-white/5 focus:text-white py-2">
                            {t('purpose_other')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">{t('start_time')}</Label>
                      <Input
                        ref={startTimeRef}
                        type="datetime-local"
                        value={startTime}
                        min={minDate}
                        onChange={(e) => setStartTime(e.target.value)}
                        onClick={() => openPicker(startTimeRef)}
                        required
                        className="glass-input text-white [color-scheme:dark] focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 px-3.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">{t('end_time')}</Label>
                      <Input
                        ref={endTimeRef}
                        type="datetime-local"
                        value={endTime}
                        min={startTime || minDate}
                        onChange={(e) => setEndTime(e.target.value)}
                        onClick={() => openPicker(endTimeRef)}
                        required
                        className="glass-input text-white [color-scheme:dark] focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 px-3.5 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-300">{t('description_label')}</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder={t('description_placeholder')}
                      className="w-full glass-input rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus:ring-0"
                    />
                  </div>

                  {/* Requester Profile */}
                  <div className="border-t border-white/5 pt-6 space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                      <User className="h-4 w-4 text-blue-400" />
                      {t('requester_section')}
                    </h3>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">{t('requester_name')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            value={requesterName}
                            onChange={(e) => setRequesterName(e.target.value)}
                            placeholder={lang === 'th' ? 'กรอกชื่อผู้จอง' : 'Enter requester name'}
                            required
                            className="glass-input text-white placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 pl-10 pr-3.5 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">{t('requester_email')}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            type="email"
                            value={requesterEmail}
                            onChange={(e) => setRequesterEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                            className="glass-input text-white placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 pl-10 pr-3.5 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-semibold text-slate-300">{t('requester_phone')}</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            type="tel"
                            value={requesterPhone}
                            onChange={(e) => setRequesterPhone(e.target.value)}
                            placeholder="081-234-5678"
                            className="glass-input text-white placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 pl-10 pr-3.5 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 rounded-lg bg-red-500/5 border border-red-500/20 p-4 text-xs text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{submitError}</span>
                    </motion.div>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/5 pt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push('/login')}
                      className="border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950 justify-between rounded-lg h-10 px-4 text-xs"
                    >
                      <span>{lang === 'th' ? 'หรือ เข้าสู่ระบบห้องเรียน' : 'Or sign in to classrooms'}</span>
                      <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="submit"
                      disabled={submitting || !selectedRoom}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/10 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 justify-center h-10 px-5 rounded-lg text-sm font-semibold"
                    >
                      {submitting ? t('submitting_booking') : t('submit_booking')}
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-20 text-center text-xs text-slate-500">
          <p>{t('footer_text')}</p>
        </div>
      </main>
    </div>
  )
}
