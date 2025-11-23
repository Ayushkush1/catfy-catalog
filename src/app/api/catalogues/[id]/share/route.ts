import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendCatalogueAccessEmail } from '@/lib/email'

// POST /api/catalogues/[id]/share - Create an access invite (view/edit) and email it
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const catalogueId = params.id
    const { email, permission } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!['view', 'edit'].includes(permission)) {
      return NextResponse.json(
        { error: 'Permission must be "view" or "edit"' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check catalogue ownership
    const catalogue = await prisma.catalogue.findFirst({
      where: { id: catalogueId, profileId: user.id },
      include: {
        profile: { select: { email: true, fullName: true } },
        invitations: true,
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found or you are not the owner' },
        { status: 404 }
      )
    }

    const existingInvitation = catalogue.invitations.find(
      inv => inv.email.toLowerCase() === email.toLowerCase()
    )

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create invitation record and set permission according to requested access
    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        token,
        permission: permission === 'edit' ? 'EDIT' : 'VIEW',
        catalogueId,
        senderId: user.id,
        expiresAt,
        status: 'PENDING',
      },
    })

    // Send email
    try {
      await sendCatalogueAccessEmail({
        inviterName: catalogue.profile.fullName || 'Catalogue Owner',
        inviterEmail: catalogue.profile.email,
        catalogueName: catalogue.name,
        invitationToken: token,
        recipientEmail: email,
        permission: permission as 'view' | 'edit',
      })
    } catch (emailError) {
      // delete invitation if email fails
      await prisma.invitation.delete({ where: { id: invitation.id } })
      console.error('Failed to send catalogue access email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Access invitation sent',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      },
    })
  } catch (error) {
    console.error('Error creating access invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
