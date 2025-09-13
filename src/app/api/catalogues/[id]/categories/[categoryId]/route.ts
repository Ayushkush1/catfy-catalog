import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime to avoid Edge Runtime issues with Prisma
export const runtime = 'nodejs'

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().optional(),
})

interface RouteParams {
  params: {
    id: string
    categoryId: string
  }
}

// GET - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
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
                profileId: profile.id
              }
            }
          } // User is a team member
        ]
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found' },
        { status: 404 }
      )
    }

    // Get category
    const category = await prisma.category.findFirst({
      where: {
        id: params.categoryId,
        catalogueId: params.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
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
                profileId: profile.id
              }
            }
          } // User is a team member
        ]
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found or access denied' },
        { status: 404 }
      )
    }

    // Verify category exists and belongs to catalogue
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.categoryId,
        catalogueId: params.id,
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // Check if new name conflicts with existing categories (if name is being updated)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          catalogueId: params.id,
          name: validatedData.name,
          id: { not: params.categoryId },
        },
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        )
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)

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

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    console.log('DELETE category request received with params:', params)

    const user = await getUser()
    if (!user) {
      console.log('No user found for delete category request')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      console.log('No profile found for user:', user.id)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('Looking for catalogue with ID:', params.id, 'for profile:', profile.id)

    // Verify catalogue ownership or team membership
    const catalogue = await prisma.catalogue.findFirst({
      where: {
        id: params.id,
        OR: [
          { profileId: profile.id }, // User owns the catalogue
          {
            teamMembers: {
              some: {
                profileId: profile.id
              }
            }
          } // User is a team member
        ]
      },
    })

    if (!catalogue) {
      console.log('Catalogue not found or no access for catalogue ID:', params.id)
      return NextResponse.json(
        { error: 'Catalogue not found or access denied' },
        { status: 404 }
      )
    }

    console.log('Looking for category with ID:', params.categoryId, 'in catalogue:', params.id)

    // Verify category exists and belongs to catalogue
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.categoryId,
        catalogueId: params.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!existingCategory) {
      console.log('Category not found with ID:', params.categoryId)
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    console.log('Found category:', existingCategory.name, 'with', existingCategory._count.products, 'products')

    // Check if category has products - if so, move them to uncategorized
    if (existingCategory._count.products > 0) {
      console.log('Moving products to uncategorized before deleting category')
      await prisma.product.updateMany({
        where: {
          categoryId: params.categoryId,
          catalogueId: params.id,
        },
        data: {
          categoryId: null,
        },
      })
    }

    // Delete category
    console.log('Deleting category with ID:', params.categoryId)
    await prisma.category.delete({
      where: {
        id: params.categoryId,
      },
    })

    console.log('Category deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}