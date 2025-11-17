import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/catalogues/[id]/plan-sharing - Get plan sharing settings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const catalogueId = params.id

    // Get catalogue with plan sharing setting
    const catalogue = await prisma.catalogue.findUnique({
      where: { id: catalogueId },
      select: {
        id: true,
        profileId: true,
        planSharingEnabled: true,
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or team member
    const isOwner = catalogue.profileId === user.id

    if (!isOwner) {
      // Check if user is a team member
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          catalogueId: catalogueId,
          profileId: user.id,
        },
      })

      if (!teamMember) {
        return NextResponse.json(
          { error: 'You do not have access to this catalogue' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      planSharingEnabled: catalogue.planSharingEnabled || false,
    })
  } catch (error) {
    console.error('Error fetching plan sharing settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/catalogues/[id]/plan-sharing - Update plan sharing settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const catalogueId = params.id
    const { enabled, memberIds } = await request.json()

    // Verify user is the owner
    const catalogue = await prisma.catalogue.findUnique({
      where: { id: catalogueId },
      select: {
        id: true,
        profileId: true,
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found' },
        { status: 404 }
      )
    }

    if (catalogue.profileId !== user.id) {
      return NextResponse.json(
        { error: 'Only the owner can change plan sharing settings' },
        { status: 403 }
      )
    }

    // Update plan sharing setting
    await prisma.catalogue.update({
      where: { id: catalogueId },
      data: { planSharingEnabled: enabled },
    })

    // Update individual team member access
    if (memberIds && Array.isArray(memberIds)) {
      // Enforce limit of 3 members
      if (memberIds.length > 3) {
        return NextResponse.json(
          {
            error:
              'You can only share premium access with up to 3 team members',
          },
          { status: 400 }
        )
      }

      // First, remove premium access from all members
      await prisma.teamMember.updateMany({
        where: {
          catalogueId: catalogueId,
          role: 'MEMBER',
        },
        data: {
          hasPremiumAccess: false,
        },
      })

      // Then, grant access to selected members
      if (enabled && memberIds.length > 0) {
        await prisma.teamMember.updateMany({
          where: {
            catalogueId: catalogueId,
            profileId: { in: memberIds },
            role: 'MEMBER',
          },
          data: {
            hasPremiumAccess: true,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      planSharingEnabled: enabled,
      sharedWithCount: memberIds?.length || 0,
    })
  } catch (error) {
    console.error('Error updating plan sharing settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
