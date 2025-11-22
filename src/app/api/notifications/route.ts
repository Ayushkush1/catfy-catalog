import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser, getUserProfile } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )

    const profile = await getUserProfile(user.id)
    if (!profile)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const cursor = searchParams.get('cursor')
    const filter = searchParams.get('filter')

    const where: any = {
      OR: [{ profileId: profile.id }, { profileId: null }],
    }

    if (filter === 'unread') {
      where.read = false
    }

    if (cursor) {
      // cursor is an ISO date string; load older items
      where.createdAt = { lt: new Date(cursor) }
    }

    const items = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const nextCursor =
      items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null

    return NextResponse.json({ items, nextCursor })
  } catch (e) {
    console.error('GET /api/notifications error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
