import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  // Protect /control-panel routes
  if (pathname.startsWith("/control-panel")) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Redirect authenticated users away from login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/control-panel', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/control-panel/:path*', '/login']
}