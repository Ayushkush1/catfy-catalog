import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/catalogues/[id]/team/permission - Update a team member's permission
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const catalogueId = params.id
    const { memberId, permission } = await request.json()

    if (!memberId || !permission) {
      return NextResponse.json(
        { error: 'memberId and permission are required' },
        { status: 400 }
      )
    }

    if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission value' },
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
        { error: 'Only the owner can update permissions' },
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

    // Persist permission in catalogue.settings JSON to avoid schema migration
    const settings = (catalogue.settings as any) || {}
    settings.teamPermissions = settings.teamPermissions || {}
    settings.teamPermissions[memberId] = permission

    await prisma.catalogue.update({
      where: { id: catalogueId },
      data: { settings },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team permission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
