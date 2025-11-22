import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser, getUserProfile } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST() {
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

    await prisma.notification.updateMany({
      where: { profileId: profile.id, read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/notifications/mark-all-read error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
