import Link from 'next/link'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-w-md flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-blue-100">
          <Compass className="h-8 w-8 text-blue-500" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          404
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          ไม่พบหน้านี้
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          เส้นทางที่คุณเข้ามาอาจถูกย้ายหรือไม่มีอยู่อีกต่อไป
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="brand">
            <Link href="/dashboard">
              <Home className="mr-1.5 h-4 w-4" />
              ไปหน้าแดชบอร์ด
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              กลับหน้าแรก
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
