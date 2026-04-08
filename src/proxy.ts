import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth_token')

  // Always allow auth routes, login page, static files, and favicon
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const isApiRoute = pathname.startsWith('/api/')
  const isProtectedPage = pathname.startsWith('/evento')

  if (!authToken && isApiRoute) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!authToken && isProtectedPage) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/evento/:path*',
    '/api/stands/:path*',
  ],
}
