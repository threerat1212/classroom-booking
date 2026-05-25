'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-4 text-center">
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-red-100">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">
          เกิดข้อผิดพลาดบางอย่าง
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {error.message || 'ระบบทำงานผิดพลาด กรุณาลองอีกครั้ง'}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="brand"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            ลองอีกครั้ง
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              กลับหน้าหลัก
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
