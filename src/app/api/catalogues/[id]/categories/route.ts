import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime to avoid Edge Runtime issues with Prisma
export const runtime = 'nodejs'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  description: z.string().optional(),
  color: z.string().optional(),
})

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get all categories for a catalogue
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Continue with normal database query for all users

    // Verify catalogue access (ownership or team membership)
    const catalogue = await prisma.catalogue.findFirst({
      where: {
        id: params.id,
        OR: [
          { profileId: profile.id }, // User owns the catalogue
          {
            teamMembers: {
              some: {
                profileId: profile.id,
              },
            },
          }, // User is a team member
        ],
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found' },
        { status: 404 }
      )
    }

    // Get categories
    const categories = await prisma.category.findMany({
      where: {
        catalogueId: params.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new category
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify catalogue access (ownership or team membership)
    const catalogue = await prisma.catalogue.findFirst({
      where: {
        id: params.id,
        OR: [
          { profileId: profile.id }, // User owns the catalogue
          {
            teamMembers: {
              some: {
                profileId: profile.id,
              },
            },
          }, // User is a team member
        ],
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    // Check if category name already exists in this catalogue
    const existingCategory = await prisma.category.findFirst({
      where: {
        catalogueId: params.id,
        name: validatedData.name,
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    // Get the next sort order
    const lastCategory = await prisma.category.findFirst({
      where: { catalogueId: params.id },
      orderBy: { sortOrder: 'desc' },
    })

    const sortOrder = (lastCategory?.sortOrder || 0) + 1

    // Create category
    const category = await prisma.category.create({
      data: {
        ...validatedData,
        color: validatedData.color || '#3b82f6',
        catalogueId: params.id,
        sortOrder,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
