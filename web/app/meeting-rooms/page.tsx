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

const PURPOSES = [
  { value: 'meeting', label: 'ประชุม', icon: Users },
  { value: 'event', label: 'จัดกิจกรรม', icon: Calendar },
  { value: 'other', label: 'อื่นๆ', icon: MapPin },
]

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

function RoomCard({ room, selected, onClick }: { room: Room; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full rounded-xl border p-4 text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">{room.name}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{room.code}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            room.status === 'available'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-amber-500/15 text-amber-400'
          }`}
        >
          {room.status === 'available' ? 'ว่าง' : room.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {room.capacity} คน
        </span>
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          ชั้น {room.floor} {room.building}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {room.room_type}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500 line-clamp-2">{room.description}</p>
    </motion.button>
  )
}

export default function MeetingRoomsPage() {
  const router = useRouter()
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
        // Some browsers reject showPicker when the click is replayed or automated.
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-violet-600/5 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">RoomBooking</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              หน้าหลัก
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/login')}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            จองห้องประชุม
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            เลือกห้องประชุมและกรอกข้อมูลเพื่อจองได้ทันที
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto max-w-md rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center backdrop-blur-sm"
            >
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
              <h2 className="mt-4 text-xl font-semibold text-white">จองสำเร็จ!</h2>
              <p className="mt-2 text-sm text-slate-300">
                คำขอจองของคุณถูกส่งแล้ว เจ้าหน้าที่จะตรวจสอบและแจ้งผลทางอีเมล
              </p>
              <Button
                className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                onClick={() => setSuccess(false)}
              >
                จองเพิ่ม
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-8 lg:grid-cols-5"
            >
              {/* Room Selection */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    เลือกห้องประชุม
                  </h2>
                  {loading ? (
                    <div className="mt-4 space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {rooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          selected={selectedRoom === room.id}
                          onClick={() => setSelectedRoom(room.id)}
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
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    ข้อมูลการจอง
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-300">หัวข้อการจอง</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="เช่น ประชุมทีมสัปดาห์"
                        required
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-slate-300">วัตถุประสงค์</Label>
                      <Select value={purpose} onValueChange={setPurpose} required>
                        <SelectTrigger className="border-white/10 bg-white/5 text-white focus:ring-blue-500">
                          <SelectValue placeholder="เลือกวัตถุประสงค์" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-slate-900">
                          {PURPOSES.map((p) => (
                            <SelectItem
                              key={p.value}
                              value={p.value}
                              className="text-white focus:bg-white/10 focus:text-white"
                            >
                              <span className="flex items-center gap-2">
                                <p.icon className="h-4 w-4" />
                                {p.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-slate-300">วัน-เวลาเริ่มต้น</Label>
                      <Input
                        ref={startTimeRef}
                        type="datetime-local"
                        value={startTime}
                        min={minDate}
                        onChange={(e) => setStartTime(e.target.value)}
                        onClick={() => openPicker(startTimeRef)}
                        required
                        className="border-white/10 bg-white/5 text-white [color-scheme:dark] focus-visible:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-slate-300">วัน-เวลาสิ้นสุด</Label>
                      <Input
                        ref={endTimeRef}
                        type="datetime-local"
                        value={endTime}
                        min={startTime || minDate}
                        onChange={(e) => setEndTime(e.target.value)}
                        onClick={() => openPicker(endTimeRef)}
                        required
                        className="border-white/10 bg-white/5 text-white [color-scheme:dark] focus-visible:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label className="text-sm text-slate-300">รายละเอียดเพิ่มเติม (ถ้ามี)</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="อุปกรณ์ที่ต้องการ, จำนวนผู้เข้าร่วม, ฯลฯ"
                      className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                      <User className="h-4 w-4 text-blue-400" />
                      ข้อมูลผู้จอง
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-300">ชื่อ-นามสกุล</Label>
                        <Input
                          value={requesterName}
                          onChange={(e) => setRequesterName(e.target.value)}
                          placeholder="ชื่อผู้จอง"
                          required
                          className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-300">อีเมล</Label>
                        <Input
                          type="email"
                          value={requesterEmail}
                          onChange={(e) => setRequesterEmail(e.target.value)}
                          placeholder="email@example.com"
                          required
                          className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-sm text-slate-300">เบอร์โทรศัพท์</Label>
                        <Input
                          type="tel"
                          value={requesterPhone}
                          onChange={(e) => setRequesterPhone(e.target.value)}
                          placeholder="081-234-5678"
                          className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {submitError}
                    </motion.div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/login')}
                      className="border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      หรือ เข้าสู่ระบบ
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !selectedRoom}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                    >
                      {submitting ? 'กำลังส่ง...' : 'ยืนยันการจอง'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-slate-600">
          <p>ระบบจองห้องประชุมและห้องเรียน · สำหรับบุคลากรและนักศึกษา</p>
        </div>
      </main>
    </div>
  )
}
