import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const publicPaths = ['/', '/meeting-rooms', '/login', '/register', '/api']
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('access_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based route guards
  const role = request.cookies.get('user_role')?.value
  const teacherPaths = ['/dashboard', '/rooms/new', '/bookings/new', '/bookings/', '/assignments/new', '/attendance', '/grades', '/export', '/users', '/teacher']
  const studentPaths = ['/student', '/classrooms/join']
  const adminPaths = ['/users']

  if (role === 'student') {
    if (teacherPaths.some((p) => pathname === p || pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  if (role === 'teacher') {
    if (studentPaths.some((p) => pathname === p || pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (adminPaths.some((p) => pathname === p || pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (role === 'guest') {
    const allowed = ['/bookings', '/rooms']
    if (!allowed.some((p) => pathname === p || pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/meeting-rooms', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.png$).*)'],
}