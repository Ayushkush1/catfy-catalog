import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/catalogues/[id]/team/responsibility - Update a team member's responsibility text
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const catalogueId = params.id
    const { memberId, responsibility } = await request.json()

    if (!memberId || typeof responsibility !== 'string') {
      return NextResponse.json(
        { error: 'memberId and responsibility are required' },
        { status: 400 }
      )
    }

    // Verify requester is the owner of the catalogue
    const catalogue = await prisma.catalogue.findUnique({
      where: { id: catalogueId },
      select: { id: true, profileId: true, settings: true },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found' },
        { status: 404 }
      )
    }

    if (catalogue.profileId !== user.id) {
      return NextResponse.json(
        { error: 'Only the owner can update responsibilities' },
        { status: 403 }
      )
    }

    // Ensure target is an existing team member
    const teamMember = await prisma.teamMember.findFirst({
      where: { catalogueId, profileId: memberId },
      select: { profileId: true },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Target user is not a team member' },
        { status: 404 }
      )
    }

    // Persist responsibility in catalogue.settings JSON
    const settings = (catalogue.settings as any) || {}
    settings.teamResponsibilities = settings.teamResponsibilities || {}
    settings.teamResponsibilities[memberId] = responsibility

    await prisma.catalogue.update({
      where: { id: catalogueId },
      data: { settings },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team responsibility:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
