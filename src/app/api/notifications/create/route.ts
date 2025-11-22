import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser, getUserProfile } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      message,
      url,
      type = 'SYSTEM',
      priority = 'MEDIUM',
      global = false,
    } = body

    const data: any = {
      title: title || 'Notification',
      message: message || '',
      url: url || null,
      type,
      priority,
    }

    if (!global) data.profileId = profile.id

    const notif = await prisma.notification.create({ data })

    return NextResponse.json({ item: notif })
  } catch (e) {
    console.error('POST /api/notifications/create error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
