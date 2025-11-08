import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/catalogues/[id]/version - Get current version
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth()
        const catalogueId = params.id

        // Get current version and last update info
        const catalogue = await prisma.catalogue.findUnique({
            where: { id: catalogueId },
            select: {
                updatedAt: true,
                profile: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        }) as any

        if (!catalogue) {
            return NextResponse.json(
                { error: 'Catalogue not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            version: catalogue.version || 1,
            updatedAt: catalogue.updatedAt,
            lastModifiedBy: catalogue.profile?.fullName || catalogue.profile?.email || 'Unknown',
        })
    } catch (error) {
        console.error('Error fetching version:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
