import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase'
import { getSupabaseConfig } from '@/lib/env'
import { isAdminEmail } from '@/lib/admin-config'

// Note: Prisma cannot be used in middleware due to Edge Runtime limitations

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // No bypass authentication - all users must authenticate properly

  try {
    const { url, anonKey } = getSupabaseConfig()
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = [
      '/dashboard',
      '/onboarding',
      '/themes',
      '/catalogues',
      '/billing',
      '/catalogue', // Protect catalogue edit routes
    ]

    // Public routes that don't require authentication
    const publicPaths = [
      '/view', // Public catalogue viewing
      '/api/catalogues/public', // Public API for fetching catalogues
    ]

    const isPublicPath = publicPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )

    // Skip authentication for public paths
    if (isPublicPath) {
      return response
    }

    const isProtectedPath =
      protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) ||
      (request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/admin/login'))

    if (isProtectedPath) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const redirectUrl = new URL('/auth', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Admin routes (exclude admin login page)
    if (
      request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')
    ) {
      console.log(
        '🔍 [MIDDLEWARE] Admin route detected:',
        request.nextUrl.pathname
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log(
        '🔍 [MIDDLEWARE] User from Supabase:',
        user ? { id: user.id, email: user.email } : 'No user'
      )

      if (!user) {
        console.log('❌ [MIDDLEWARE] No user found, returning auth error')
        // For API routes, return JSON error instead of redirect
        if (request.nextUrl.pathname.startsWith('/api/admin')) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Check if user is admin
      console.log(
        '🔍 [MIDDLEWARE] Checking admin status for email:',
        user.email
      )
      const isAdmin = user.email && isAdminEmail(user.email)
      console.log('🔍 [MIDDLEWARE] Is admin?', isAdmin)

      if (!isAdmin) {
        console.log(
          '❌ [MIDDLEWARE] User is not admin, returning access denied'
        )
        // For API routes, return JSON error instead of redirect
        if (request.nextUrl.pathname.startsWith('/api/admin')) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      console.log(
        '✅ [MIDDLEWARE] Admin access granted for:',
        request.nextUrl.pathname
      )
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth')) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Allow access to reset password page for password recovery
        if (request.nextUrl.pathname === '/auth/reset-password') {
          return NextResponse.next()
        }

        const redirectTo =
          request.nextUrl.searchParams.get('redirect') || '/dashboard'
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
    }

    // Catalogue access control for team collaboration
    // Note: Temporarily disabled due to Prisma Edge Runtime limitations
    // This check should be moved to the actual page components or API routes
    /*
  const catalogueEditMatch = request.nextUrl.pathname.match(/^\/catalogue\/([^/]+)\/edit/)
  if (catalogueEditMatch && !isTestUser && !isAdminUser) {
    const catalogueId = catalogueEditMatch[1]
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      try {
        // Check if user owns the catalogue or is a team member
        const hasAccess = await prisma.catalogue.findFirst({
          where: {
            id: catalogueId,
            OR: [
              { profileId: user.id },
              {
                teamMembers: {
                  some: {
                    profileId: user.id
                  }
                }
              }
            ]
          }
        })

        if (!hasAccess) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        console.error('Error checking catalogue access:', error)
        // Allow access on error to prevent blocking legitimate users
      }
    }
  }
  */

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return response without authentication checks if environment validation fails
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/webhooks).*)',
  ],
}
