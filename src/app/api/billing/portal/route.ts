import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCustomerPortalUrl } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const profile = await getUserProfile(user.id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the latest active subscription for the user
    const subscription = await prisma.subscription.findFirst({
      where: {
        profileId: profile.id,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        stripeCustomerId: true,
      },
    })

    const customerId = subscription?.stripeCustomerId

    if (!customerId) {
      return NextResponse.json(
        { error: 'No billing information found' },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/dashboard/billing`
    const url = await getCustomerPortalUrl(customerId, returnUrl)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Customer portal error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to open billing portal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}