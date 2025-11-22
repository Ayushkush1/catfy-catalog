import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser, getUserProfile } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = params.id

    // Only allow marking notifications that belong to the user or are global
    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif)
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    if (notif.profileId && notif.profileId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.notification.update({ where: { id }, data: { read: true } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/notifications/[id]/mark-read error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
